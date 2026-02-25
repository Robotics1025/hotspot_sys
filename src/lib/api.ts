interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}

interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ApiClient {
    private baseUrl: string;
    private defaultTimeout: number;
    private defaultRetries: number;

    constructor(baseUrl: string = '', timeout: number = 10000, retries: number = 3) {
        this.baseUrl = baseUrl;
        this.defaultTimeout = timeout;
        this.defaultRetries = retries;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async fetchWithTimeout(
        url: string,
        options: FetchOptions = {}
    ): Promise<Response> {
        const { timeout = this.defaultTimeout, ...fetchOptions } = options;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    private async makeRequest<T>(
        url: string,
        options: FetchOptions = {}
    ): Promise<ApiResponse<T>> {
        const {
            retries = this.defaultRetries,
            retryDelay = 1000,
            ...fetchOptions
        } = options;

        let lastError: Error;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
                const response = await this.fetchWithTimeout(fullUrl, fetchOptions);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new ApiError(
                        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        errorData.code
                    );
                }

                const data = await response.json();
                return { data, success: true };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                // Don't retry on client errors (4xx)
                if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
                    break;
                }

                // Wait before retrying (except on last attempt)
                if (attempt < retries) {
                    await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
                }
            }
        }

        return {
            error: lastError.message,
            success: false
        };
    }

    async get<T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(url, {
            ...options,
            method: 'GET',
        });
    }

    async post<T>(url: string, body: any, options: FetchOptions = {}): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(body),
        });
    }

    async put<T>(url: string, body: any, options: FetchOptions = {}): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(body),
        });
    }

    async delete<T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(url, {
            ...options,
            method: 'DELETE',
        });
    }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Utility function for building query parameters
export function buildQueryParams(params: Record<string, string | number | boolean | undefined | null>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

// Type-safe API endpoint definitions
export const endpoints = {
    // Admin endpoints
    admin: {
        clients: '/api/admin/clients',
        routers: '/api/admin/routers',
        vouchers: '/api/admin/vouchers',
        transactions: '/api/admin/transactions',
        analytics: '/api/admin/analytics',
        stats: '/api/admin/stats',
        plans: '/api/admin/plans',
    },
    // Client endpoints
    client: {
        stats: '/api/client/stats',
        vouchers: '/api/client/vouchers',
        plans: '/api/client/plans',
        routers: '/api/client/routers',
    },
} as const;

export { ApiError };