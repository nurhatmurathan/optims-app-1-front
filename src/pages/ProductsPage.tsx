import { useState, useMemo } from "react";
import { Button, Space } from "antd";
import { useProducts } from "@/queries";
import { ProductTable, SearchInput } from "@/components";

export default function ProductsPage() {
    const [page] = useState(1);
    const [size] = useState(8);

    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");

    const canSearch = useMemo(() => Boolean(search.trim()), [search]);

    const submitSearch = () => {
        if (!canSearch) return;
        setQuery(search.trim());
    };

    const { data, isLoading } = useProducts(
        { page, size, search: query },
        { enabled: Boolean(query) },
    );

    const rows = data?.data ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="p-4 space-y-4">
            <Space wrap>
                <SearchInput searchValue={search} setSearchValue={setSearch} />
                <Button type="primary" onClick={submitSearch} disabled={!canSearch}>
                    Найти
                </Button>
                {query && (
                    <Button
                        onClick={() => {
                            setSearch("");
                            setQuery("");
                        }}
                    >
                        Очистить
                    </Button>
                )}
            </Space>

            <ProductTable
                data={rows}
                total={total}
                page={1}
                size={size}
                loading={isLoading}
                hidePagination
            />
        </div>
    );
}
