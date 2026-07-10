#!/usr/bin/env python3
"""
Market Status Checker

Tells you whether the world's major stock markets are OPEN or CLOSED
right now, based on each exchange's local time and regular trading hours.

Run it with:  python3 market_status.py

Requires Python 3.9+ (uses the built-in zoneinfo module — no pip installs).

Note: this checks weekdays and trading hours (including lunch breaks for
Asian exchanges). It does NOT know about public holidays or half-days, so
on e.g. Christmas it will still say "open" during normal hours.
"""

from datetime import datetime, time
from zoneinfo import ZoneInfo


# Each market: name, timezone, and one or more (open, close) sessions in
# local exchange time. Markets with a lunch break have two sessions.
MARKETS = [
    ("New York Stock Exchange (NYSE)", "America/New_York",
     [(time(9, 30), time(16, 0))]),
    ("Nasdaq", "America/New_York",
     [(time(9, 30), time(16, 0))]),
    ("Toronto Stock Exchange (TSX)", "America/Toronto",
     [(time(9, 30), time(16, 0))]),
    ("London Stock Exchange (LSE)", "Europe/London",
     [(time(8, 0), time(16, 30))]),
    ("Frankfurt (Deutsche Börse Xetra)", "Europe/Berlin",
     [(time(9, 0), time(17, 30))]),
    ("Euronext Paris", "Europe/Paris",
     [(time(9, 0), time(17, 30))]),
    ("SIX Swiss Exchange (Zurich)", "Europe/Zurich",
     [(time(9, 0), time(17, 30))]),
    ("Bombay/National SE India (BSE/NSE)", "Asia/Kolkata",
     [(time(9, 15), time(15, 30))]),
    ("Tokyo Stock Exchange (TSE)", "Asia/Tokyo",
     [(time(9, 0), time(11, 30)), (time(12, 30), time(15, 30))]),
    ("Hong Kong Exchange (HKEX)", "Asia/Hong_Kong",
     [(time(9, 30), time(12, 0)), (time(13, 0), time(16, 0))]),
    ("Shanghai Stock Exchange (SSE)", "Asia/Shanghai",
     [(time(9, 30), time(11, 30)), (time(13, 0), time(15, 0))]),
    ("Singapore Exchange (SGX)", "Asia/Singapore",
     [(time(9, 0), time(12, 0)), (time(13, 0), time(17, 0))]),
    ("Korea Exchange (KRX)", "Asia/Seoul",
     [(time(9, 0), time(15, 30))]),
    ("Australian Securities Exchange (ASX)", "Australia/Sydney",
     [(time(10, 0), time(16, 0))]),
]


def market_status(tz_name, sessions):
    """Return (is_open, local_now, detail) for one market."""
    local_now = datetime.now(ZoneInfo(tz_name))

    # Saturday = 5, Sunday = 6
    if local_now.weekday() >= 5:
        return False, local_now, "weekend"

    now_t = local_now.time()
    for open_t, close_t in sessions:
        if open_t <= now_t < close_t:
            return True, local_now, f"closes {close_t.strftime('%H:%M')}"

    # Closed on a weekday — say when it opens next (today or next session).
    for open_t, _ in sessions:
        if now_t < open_t:
            return False, local_now, f"opens {open_t.strftime('%H:%M')} today"
    return False, local_now, "closed for the day"


def main():
    now_utc = datetime.now(ZoneInfo("UTC"))
    print()
    print(f"  MARKET STATUS  —  {now_utc.strftime('%A %d %B %Y, %H:%M UTC')}")
    print("  " + "─" * 76)

    open_count = 0
    for name, tz_name, sessions in MARKETS:
        is_open, local_now, detail = market_status(tz_name, sessions)
        if is_open:
            open_count += 1
        status = "🟢 OPEN  " if is_open else "🔴 CLOSED"
        local_str = local_now.strftime("%H:%M local")
        print(f"  {status}  {name:<40} {local_str:>12}  ({detail})")

    # Two "markets" that never follow exchange hours:
    print("  " + "─" * 76)
    print(f"  🟢 OPEN    {'Crypto (Bitcoin, etc.)':<40} {'24/7':>12}  (never closes)")

    # Forex runs Sunday 17:00 New York time through Friday 17:00 New York time.
    ny = datetime.now(ZoneInfo("America/New_York"))
    fx_open = not (
        ny.weekday() == 5
        or (ny.weekday() == 6 and ny.time() < time(17, 0))
        or (ny.weekday() == 4 and ny.time() >= time(17, 0))
    )
    fx_status = "🟢 OPEN  " if fx_open else "🔴 CLOSED"
    print(f"  {fx_status}  {'Forex (currency market)':<40} {'':>12}  "
          f"({'open Sun 5pm – Fri 5pm NY time'})")

    print("  " + "─" * 76)
    print(f"  {open_count} of {len(MARKETS)} stock exchanges are open right now.")
    print("  (Holidays are not checked — hours shown are regular trading hours.)")
    print()


if __name__ == "__main__":
    main()
