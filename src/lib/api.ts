import api from '../api/axios';
import axios from 'axios';

/** Extract a human-readable message from an Axios error */
function extractMessage(err: unknown, fallback: string): never {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
        throw new Error(err.response.data.message);
    }
    if (err instanceof Error) throw new Error(err.message || fallback);
    throw new Error(fallback);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    try {
        const response = await api.post<T>(path, body);
        return response.data;
    } catch (err) {
        extractMessage(err, 'Request failed');
    }
}

export async function apiGet<T>(path: string): Promise<T> {
    try {
        const response = await api.get<T>(path);
        return response.data;
    } catch (err) {
        extractMessage(err, 'Request failed');
    }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
    try {
        const response = await api.put<T>(path, body);
        return response.data;
    } catch (err) {
        extractMessage(err, 'Request failed');
    }
}

export async function apiDelete<T>(path: string): Promise<T> {
    try {
        const response = await api.delete<T>(path);
        return response.data;
    } catch (err) {
        extractMessage(err, 'Request failed');
    }
}
