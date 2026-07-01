// Production API client with authentication, retry, and error handling
// Designed for real backend integration

import { logger } from '../utils/logger';
import { retryService } from '../utils/resilience';

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryConfig?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;
  private authToken: string | null = null;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  clearAuthToken(): void {
    this.authToken = null;
    delete this.headers['Authorization'];
  }

  private getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = this.getUrl(endpoint);

    try {
      const response = await retryService.executeWithRetry(
        () => this.fetchWithTimeout(url, {
          ...options,
          headers: { ...this.headers, ...options.headers },
        }),
        {
          maxAttempts: 3,
          shouldRetry: (error) => {
            // Retry on network errors and server errors
            return error.code === 'ECONNREFUSED' ||
                   error.code === 'TIMEOUT' ||
                   (error.status >= 500 && error.status < 600) ||
                   error.status === 429;
          },
        }
      );

      const contentType = response.headers.get('content-type');
      let body: T | null = null;

      if (contentType?.includes('application/json')) {
        body = await response.json();
      } else if (contentType?.includes('text')) {
        body = (await response.text()) as T;
      }

      if (!response.ok) {
        logger.error(`API error: ${endpoint}`, {
          status: response.status,
          error: body,
        }, 'API');

        return {
          success: false,
          error: typeof body === 'object' && body && 'message' in body
            ? (body as any).message
            : `API error: ${response.status}`,
          status: response.status,
        };
      }

      logger.debug(`API success: ${endpoint}`, { status: response.status }, 'API');

      return {
        success: true,
        data: body ?? undefined,
        status: response.status,
      };
    } catch (error: any) {
      logger.error(`API request failed: ${endpoint}`, error, 'API');

      return {
        success: false,
        error: error.message || 'Network error',
        status: 0,
      };
    }
  }
}

// Initialize with your API endpoint
// export const apiClient = new ApiClient({
//   baseUrl: 'https://api.vela.app/v1',
//   timeout: 30000,
// });

// For development/mock, export as mock
export const createApiClient = (config: ApiConfig) => new ApiClient(config);
