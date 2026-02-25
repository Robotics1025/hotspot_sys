"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiResponse } from '@/lib/api';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    setData: (data: T | null) => void;
}

interface UseApiOptions {
    immediate?: boolean;
    dependencies?: any[];
}

export function useApi<T>(
    endpoint: string,
    options: UseApiOptions = {}
): UseApiState<T> {
    const { immediate = true, dependencies = [] } = options;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        try {
            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();
            setLoading(true);
            setError(null);

            const response: ApiResponse<T> = await apiClient.get(endpoint, {
                signal: abortControllerRef.current.signal,
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.error || 'Failed to fetch data');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, immediate, ...dependencies]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        setData,
    };
}

interface UseMutationState<T, V> {
    data: T | null;
    loading: boolean;
    error: string | null;
    mutate: (variables: V) => Promise<T | null>;
    reset: () => void;
}

interface UseMutationOptions<T, V> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
}

export function useMutation<T, V>(
    mutationFn: (variables: V) => Promise<ApiResponse<T>>,
    options: UseMutationOptions<T, V> = {}
): UseMutationState<T, V> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = useCallback(async (variables: V): Promise<T | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await mutationFn(variables);

            if (response.success && response.data) {
                setData(response.data);
                options.onSuccess?.(response.data);
                return response.data;
            } else {
                const errorMsg = response.error || 'Mutation failed';
                setError(errorMsg);
                options.onError?.(errorMsg);
                return null;
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMsg);
            options.onError?.(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [mutationFn, options]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        mutate,
        reset,
    };
}

// Hook for paginated data
interface UsePaginatedApiState<T> extends UseApiState<T> {
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    total: number;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function usePaginatedApi<T>(
    baseEndpoint: string,
    initialPage: number = 1,
    limit: number = 50
): UsePaginatedApiState<T[]> {
    const [page, setPage] = useState(initialPage);
    const [pagination, setPagination] = useState({
        page: initialPage,
        limit,
        total: 0,
        totalPages: 0,
    });

    const endpoint = `${baseEndpoint}?page=${page}&limit=${limit}`;
    
    const { data: rawData, loading, error, refetch } = useApi<PaginatedResponse<T>>(endpoint, {
        dependencies: [page, limit],
    });

    const data = rawData?.data || null;
    
    useEffect(() => {
        if (rawData?.pagination) {
            setPagination(rawData.pagination);
        }
    }, [rawData]);

    return {
        data,
        loading,
        error,
        refetch,
        setData: (newData: T[] | null) => {
            // This is a simplified implementation
            // In a real app, you might want more sophisticated data management
        },
        page: pagination.page,
        setPage,
        totalPages: pagination.totalPages,
        total: pagination.total,
    };
}

// Hook for optimistic updates
export function useOptimistic<T>(initialData: T | null = null) {
    const [optimisticData, setOptimisticData] = useState<T | null>(initialData);
    const [actualData, setActualData] = useState<T | null>(initialData);

    const updateOptimistic = useCallback((newData: T | null) => {
        setOptimisticData(newData);
    }, []);

    const updateActual = useCallback((newData: T | null) => {
        setActualData(newData);
        setOptimisticData(newData);
    }, []);

    const revert = useCallback(() => {
        setOptimisticData(actualData);
    }, [actualData]);

    return {
        data: optimisticData,
        updateOptimistic,
        updateActual,
        revert,
    };
}