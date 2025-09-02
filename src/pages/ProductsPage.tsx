import { useEffect, useState } from "react";
import { ProductTable, SearchInput } from "../components";
import { useProducts } from "../queries";

export default function ProductsPage() {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(8);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setPage(1);
    }, [search]);

    const { data, isLoading } = useProducts({ page, size, search });

    const rows = data?.data ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="p-4 space-y-4">
            {/* поле поиска — твой SearchInput */}
            <SearchInput searchValue={search} setSearchValue={setSearch} />

            <ProductTable
                data={rows}
                total={total}
                page={page}
                size={size}
                loading={isLoading}
                onPageChange={(p, ps) => {
                    setPage(p);
                    setSize(ps);
                }}
                onRowClick={(record) => {
                    // например, открыть карточку товара
                    window.open(record.shop_link, "_blank", "noopener,noreferrer");
                }}
            />
        </div>
    );
}
