/**
 * React Query client configuration and API utilities
 * 
 * Provides:
 * - Configured QueryClient for data fetching
 * - Generic API request function with proper error handling
 * - Support for both JSON and FormData requests
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Check if HTTP response is successful, throw error if not
 * Extracts error message from response body for better error reporting
 * 
 * @param res - Fetch Response object
 * @throws Error with status code and message if response is not ok
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Generic API request function with automatic error handling
 * Handles both JSON and FormData payloads appropriately
 * 
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - Request URL endpoint
 * @param data - Request body data (JSON object or FormData)
 * @returns Promise resolving to the Response object
 * @throws Error if request fails or response is not ok
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isFormData = data instanceof FormData;
  
  const res = await fetch(url, {
    method,
    // Set Content-Type for JSON, let browser set it for FormData (with boundary)
    headers: data && !isFormData ? { "Content-Type": "application/json" } : {},
    // Send FormData directly, stringify other data types
    body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    credentials: "include", // Include cookies for session management
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
