import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL as string;

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

export function getErrorMessage(err: unknown): string {
    if (typeof err === "string") return err;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const any = err as any;
    return (
        any?.response?.data?.detail ??
        any?.response?.data?.message ??
        any?.message ??
        "Unknown error"
    );
}
