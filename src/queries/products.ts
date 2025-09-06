import { getProductDetail, paginatedListProducts } from "@/api";
import type { PaginatedContent, ProductCoverType, ProductDetailType } from "@/types";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type Params = { page?: number; size?: number; search?: string };

export function useProducts(
    params: Params,
    options?: Pick<UseQueryOptions<PaginatedContent<ProductCoverType>>, "enabled">,
) {
    const { enabled = true } = options ?? {};
    return useQuery<PaginatedContent<ProductCoverType>>({
        queryKey: ["products", params],
        queryFn: ({ signal }) => paginatedListProducts(params, signal),
        placeholderData: (prev) => prev,
        staleTime: 60_000,
        gcTime: 5 * 60 * 1000,
        enabled,
        ...options,
    });
}

export function useProduct(id: string | null) {
    return useQuery<ProductDetailType>({
        queryKey: ["product-detail", id],
        queryFn: ({ signal }) => getProductDetail(id as string, signal),
        enabled: !!id,
        placeholderData: (prev) => prev,
        staleTime: 5 * 60_000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });
}
