import { ref, type Ref } from 'vue';
import { apiClient } from '../boot/axios';
import type { ApiResponse, PaginatedResponse, QueryParams } from '../types/common.types';
import type { AxiosResponse } from 'axios';

/**
 * Composable for making API calls with loading, error, and data state
 */
export function useApi<T = any>() {
    const data = ref<T | null>(null) as Ref<T | null>;
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const statusCode = ref<number | null>(null);

    /**
     * Execute a GET request
     */
    async function get(url: string, params?: Record<string, any>): Promise<T | null> {
        isLoading.value = true;
        error.value = null;

        try {
            const response: AxiosResponse<ApiResponse<T>> = await apiClient.get(url, { params });
            statusCode.value = response.status;

            if (response.data.success) {
                data.value = response.data.data;
                return response.data.data;
            }

            error.value = response.data.message || 'Request failed';
            return null;
        } catch (err: any) {
            statusCode.value = err.response?.status || 0;
            error.value = err.response?.data?.message || err.message || 'Network error';
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Execute a POST request
     */
    async function post(url: string, body?: any): Promise<T | null> {
        isLoading.value = true;
        error.value = null;

        try {
            const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(url, body);
            statusCode.value = response.status;

            if (response.data.success) {
                data.value = response.data.data;
                return response.data.data;
            }

            error.value = response.data.message || 'Request failed';
            return null;
        } catch (err: any) {
            statusCode.value = err.response?.status || 0;
            error.value = err.response?.data?.message || err.message || 'Network error';
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Execute a PUT request
     */
    async function put(url: string, body?: any): Promise<T | null> {
        isLoading.value = true;
        error.value = null;

        try {
            const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(url, body);
            statusCode.value = response.status;

            if (response.data.success) {
                data.value = response.data.data;
                return response.data.data;
            }

            error.value = response.data.message || 'Request failed';
            return null;
        } catch (err: any) {
            statusCode.value = err.response?.status || 0;
            error.value = err.response?.data?.message || err.message || 'Network error';
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Execute a PATCH request
     */
    async function patch(url: string, body?: any): Promise<T | null> {
        isLoading.value = true;
        error.value = null;

        try {
            const response: AxiosResponse<ApiResponse<T>> = await apiClient.patch(url, body);
            statusCode.value = response.status;

            if (response.data.success) {
                data.value = response.data.data;
                return response.data.data;
            }

            error.value = response.data.message || 'Request failed';
            return null;
        } catch (err: any) {
            statusCode.value = err.response?.status || 0;
            error.value = err.response?.data?.message || err.message || 'Network error';
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Execute a DELETE request
     */
    async function del(url: string): Promise<boolean> {
        isLoading.value = true;
        error.value = null;

        try {
            const response: AxiosResponse<ApiResponse<T>> = await apiClient.delete(url);
            statusCode.value = response.status;

            if (response.data.success) {
                return true;
            }

            error.value = response.data.message || 'Delete failed';
            return false;
        } catch (err: any) {
            statusCode.value = err.response?.status || 0;
            error.value = err.response?.data?.message || err.message || 'Network error';
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Execute a paginated GET request
     */
    async function getPaginated(url: string, params?: QueryParams): Promise<PaginatedResponse<T> | null> {
        isLoading.value = true;
        error.value = null;

        try {
            const response: AxiosResponse<PaginatedResponse<T>> = await apiClient.get(url, { params });
            statusCode.value = response.status;

            if (response.data.success) {
                return response.data;
            }

            error.value = response.data.message || 'Request failed';
            return null;
        } catch (err: any) {
            statusCode.value = err.response?.status || 0;
            error.value = err.response?.data?.message || err.message || 'Network error';
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Clear error state
     */
    function clearError(): void {
        error.value = null;
        statusCode.value = null;
    }

    /**
     * Reset all state
     */
    function reset(): void {
        data.value = null;
        isLoading.value = false;
        error.value = null;
        statusCode.value = null;
    }

    return {
        data,
        isLoading,
        error,
        statusCode,
        get,
        post,
        put,
        patch,
        del,
        getPaginated,
        clearError,
        reset,
    };
}