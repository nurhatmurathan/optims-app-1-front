export interface ProductCoverType {
    id: string;
    config_sku?: string;
    title: string;
    shop_link: string;
    images: string[];
}

export interface ProductDetailType {
    id: string;
    config_sku?: string;
    title: string;
    brand?: string;
    category_id: string;
    shop_link: string;
    images: string[];
    category_codes: string[];
    categories: string[];
}
