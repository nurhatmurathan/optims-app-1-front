import type { PaginatedContent, ProductCoverType } from "../types";
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
