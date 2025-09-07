// queries/useProductRatings.ts
import { productRatings } from "@/api";
import type { ProductRatingCoverType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

export type RatingsParams = {
    session_city_id: string;
    promoted_card: boolean;
    date_from: Date;
    date_till: Date;
    session_category_filter_id?: number;
};

type RatingsParamsWire = Omit<RatingsParams, "date_from" | "date_till"> & {
    date_from: string;
    date_till: string;
};

export function useProductRatings(product_id: string, params: RatingsParams) {
    const date_from_str = dayjs(params.date_from).format("YYYY-MM-DD");
    const date_till_str = dayjs(params.date_till).format("YYYY-MM-DD");

    const key = [
        "product-ratings",
        product_id,
        params.session_city_id,
        params.promoted_card,
        params.session_category_filter_id ?? null,
        date_from_str,
        date_till_str,
    ] as const;

    return useQuery<ProductRatingCoverType[]>({
        queryKey: key,
        queryFn: ({ signal }) =>
            productRatings(
                product_id,
                {
                    ...params,
                    date_from: date_from_str,
                    date_till: date_till_str,
                } as RatingsParamsWire,
                signal,
            ),
        placeholderData: (prev) => prev,
        staleTime: 60_000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
    });
}
