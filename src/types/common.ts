export interface PaginatedContent<T> {
    total: number;
    page: number;
    size: number;
    data: T[];
}
