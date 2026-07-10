#!/usr/bin/env python3
"""
Market Status Checker — live & holiday-aware

Tells you whether the world's major stock markets are OPEN or CLOSED at
the exact moment you run it, using each exchange's official trading
calendar: regular hours, weekends, public holidays, half-days, lunch
breaks, and daylight-saving shifts are all accounted for.

Setup (one time):
    pip install exchange_calendars

Run it with:
    python3 market_status.py

If the library isn't installed, the script still works in an approximate
mode (weekdays + regular hours only, no holidays) and tells you so.

Keep the holiday data fresh occasionally with:
    pip install --upgrade exchange_calendars
"""

from datetime import datetime, time
from zoneinfo import ZoneInfo

try:
    import exchange_calendars as xcals
    import pandas as pd
    HAVE_CALENDARS = True
except ImportError:
    HAVE_CALENDARS = False


# name, exchange_calendars code, timezone, fallback sessions (local time)
MARKETS = [
    ("New York Stock Exchange (NYSE)", "XNYS", "America/New_York",
     [(time(9, 30), time(16, 0))]),
    ("Nasdaq", "XNAS", "America/New_York",
     [(time(9, 30), time(16, 0))]),
    ("Toronto Stock Exchange (TSX)", "XTSE", "America/Toronto",
     [(time(9, 30), time(16, 0))]),
    ("London Stock Exchange (LSE)", "XLON", "Europe/London",
     [(time(8, 0), time(16, 30))]),
    ("Frankfurt (Deutsche Börse Xetra)", "XETR", "Europe/Berlin",
     [(time(9, 0), time(17, 30))]),
    ("Euronext Paris", "XPAR", "Europe/Paris",
     [(time(9, 0), time(17, 30))]),
    ("SIX Swiss Exchange (Zurich)", "XSWX", "Europe/Zurich",
     [(time(9, 0), time(17, 30))]),
    ("Bombay Stock Exchange (India)", "XBOM", "Asia/Kolkata",
     [(time(9, 15), time(15, 30))]),
    ("Tokyo Stock Exchange (TSE)", "XTKS", "Asia/Tokyo",
     [(time(9, 0), time(11, 30)), (time(12, 30), time(15, 30))]),
    ("Hong Kong Exchange (HKEX)", "XHKG", "Asia/Hong_Kong",
     [(time(9, 30), time(12, 0)), (time(13, 0), time(16, 0))]),
    ("Shanghai Stock Exchange (SSE)", "XSHG", "Asia/Shanghai",
     [(time(9, 30), time(11, 30)), (time(13, 0), time(15, 0))]),
    ("Singapore Exchange (SGX)", "XSES", "Asia/Singapore",
     [(time(9, 0), time(12, 0)), (time(13, 0), time(17, 0))]),
    ("Korea Exchange (KRX)", "XKRX", "Asia/Seoul",
     [(time(9, 0), time(15, 30))]),
    ("Australian Securities Exchange (ASX)", "XASX", "Australia/Sydney",
     [(time(10, 0), time(16, 0))]),
]


def when_phrase(moment, local_now):
    """Human wording for a future local time: 'today 09:30', 'tomorrow ...'."""
    days_ahead = (moment.date() - local_now.date()).days
    if days_ahead == 0:
        return f"today {moment:%H:%M}"
    if days_ahead == 1:
        return f"tomorrow {moment:%H:%M}"
    return f"{moment:%a %d %b %H:%M}"


def calendar_status(code, tz_name, now_utc):
    """Exact status from the official exchange calendar."""
    start = f"{now_utc.year - 1}-01-01"
    try:
        # Narrow date range keeps startup fast.
        cal = xcals.get_calendar(code, start=start, end=f"{now_utc.year + 1}-12-31")
    except ValueError:
        # Some calendars' holiday data doesn't reach next year yet; the
        # library clamps to its own bound when no end is given.
        cal = xcals.get_calendar(code, start=start)
    tz = ZoneInfo(tz_name)
    local_now = now_utc.tz_convert(tz)

    if cal.is_open_on_minute(now_utc):
        close = cal.next_close(now_utc).tz_convert(tz)
        return True, local_now, f"closes {close:%H:%M}"

    next_open = cal.next_open(now_utc).tz_convert(tz)
    opens = f"opens {when_phrase(next_open, local_now)}"

    if cal.is_open_on_minute(now_utc, ignore_breaks=True):
        return False, local_now, f"lunch break, re{opens}"
    if local_now.weekday() >= 5:
        return False, local_now, f"weekend, {opens}"
    if not cal.is_session(local_now.date()):
        return False, local_now, f"HOLIDAY, {opens}"
    return False, local_now, opens


def fallback_status(tz_name, sessions):
    """Approximate status: weekdays + regular hours, no holidays."""
    local_now = datetime.now(ZoneInfo(tz_name))
    if local_now.weekday() >= 5:
        return False, local_now, "weekend"
    now_t = local_now.time()
    for open_t, close_t in sessions:
        if open_t <= now_t < close_t:
            return True, local_now, f"closes {close_t:%H:%M}"
    for open_t, _ in sessions:
        if now_t < open_t:
            return False, local_now, f"opens today {open_t:%H:%M}"
    return False, local_now, "closed for the day"


def main():
    now = datetime.now(ZoneInfo("UTC"))
    print()
    print(f"  MARKET STATUS  —  {now:%A %d %B %Y, %H:%M UTC}")
    if HAVE_CALENDARS:
        print("  Using official exchange calendars (holidays & half-days included).")
        now_utc = pd.Timestamp.now(tz="UTC").floor("min")
    else:
        print("  ⚠ APPROXIMATE MODE — holidays not checked!")
        print("  For exact live status run:  pip install exchange_calendars")
    print("  " + "─" * 78)

    open_count = 0
    for name, code, tz_name, sessions in MARKETS:
        if HAVE_CALENDARS:
            is_open, local_now, detail = calendar_status(code, tz_name, now_utc)
        else:
            is_open, local_now, detail = fallback_status(tz_name, sessions)
        if is_open:
            open_count += 1
        status = "🟢 OPEN  " if is_open else "🔴 CLOSED"
        print(f"  {status}  {name:<38} {local_now:%H:%M} local  ({detail})")

    print("  " + "─" * 78)
    print(f"  🟢 OPEN    {'Crypto (Bitcoin, etc.)':<38} 24/7         (never closes)")

    # Forex runs Sunday 17:00 New York time through Friday 17:00 New York time.
    ny = datetime.now(ZoneInfo("America/New_York"))
    fx_open = not (
        ny.weekday() == 5
        or (ny.weekday() == 6 and ny.time() < time(17, 0))
        or (ny.weekday() == 4 and ny.time() >= time(17, 0))
    )
    fx_status = "🟢 OPEN  " if fx_open else "🔴 CLOSED"
    print(f"  {fx_status}  {'Forex (currency market)':<38}              "
          f"(Sun 5pm – Fri 5pm NY time)")

    print("  " + "─" * 78)
    print(f"  {open_count} of {len(MARKETS)} stock exchanges are open right now.")
    print()


if __name__ == "__main__":
    main()
