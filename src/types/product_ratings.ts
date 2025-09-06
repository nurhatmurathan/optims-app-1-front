export interface ProductRatingCoverType {
    min_price: number;
    price_before_discount?: number;
    discount?: number;
    feedbacks_count?: number;
    rating?: number;
    page: number;
    place: number;
    promoted_card?: boolean;
    promoted_merchant_id?: string;
    promoted_campaign_id?: string;
    delivery_duration?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    promo?: any;
    session_created_at: Date;
    session_city_id: string;
    session_category_filter_id?: number;
}
