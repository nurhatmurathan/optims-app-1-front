import { productRatings } from "@/api";
import type { ProductRatingCoverType } from "@/types";
import { useQuery } from "@tanstack/react-query";

type Params = {
    session_city_id: string;
    promoted_card: boolean;
    date_from: Date;
    date_till: Date;
    session_category_filter_id?: number;
};

export function useProductRatings(product_id: string, params: Params) {
    return useQuery<ProductRatingCoverType[]>({
        queryKey: ["product-ratings", params],
        queryFn: ({ signal }) => productRatings(product_id, params, signal),
        placeholderData: (prev) => prev,
        staleTime: 60_000,
        gcTime: 5 * 60 * 1000,
    });
}
