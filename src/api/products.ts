import type { PaginatedContent, ProductCoverType, ProductDetailType } from "@/types";
import { api } from "./client";

export function paginatedListProducts(
    params: { page?: number; size?: number; search?: string },
    signal?: AbortSignal,
) {
    return api
        .get<PaginatedContent<ProductCoverType>>("/api/products/list", {
            params,
            signal,
        })
        .then((r) => r.data);
}

export function getProductDetail(id: string, signal?: AbortSignal) {
    return api.get<ProductDetailType>(`/api/products/detail/${id}`, { signal }).then((r) => r.data);
}
