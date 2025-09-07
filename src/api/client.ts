import { API_URL } from "@/config";
import axios from "axios";

export const api = axios.create({
    baseURL: API_URL,
});

export function getErrorMessage(err: unknown): string {
    if (typeof err === "string") return err;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const any = err as any;
    return (
        any?.response?.data?.detail ??
        any?.response?.data?.message ??
        any?.detail ??
        "Unknown error"
    );
}
