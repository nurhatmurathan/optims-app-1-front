import { useQuery } from "@tanstack/react-query";
import { paginatedListProducts } from "../api";
import type { PaginatedContent, ProductCoverType } from "../types";

export function useProducts(params: { page?: number; size?: number; search?: string }) {
    return useQuery<PaginatedContent<ProductCoverType>>({
        queryKey: ["products", params],
        queryFn: ({ signal }) => paginatedListProducts(params, signal),
        placeholderData: (prev) => prev,
        staleTime: 60_000,
        gcTime: 5 * 60 * 1000,
    });
}
