import type { ProductRatingCoverType } from "@/types";
import { api } from "./client";

export function productRatings(
    product_id: string,
    params: {
        session_city_id: string;
        promoted_card: boolean;
        date_from: string;
        date_till: string;
        session_category_filter_id?: number;
    },
    signal?: AbortSignal,
) {
    return api
        .get<ProductRatingCoverType[]>(`/api/product-ratings/product/${product_id}`, {
            params,
            signal,
        })
        .then((r) => r.data);
}
