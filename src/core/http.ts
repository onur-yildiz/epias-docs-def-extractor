import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";

const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

export const fetchWithTimeout = async (
    url: RequestInfo,
    init?: RequestInit,
    timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
};

