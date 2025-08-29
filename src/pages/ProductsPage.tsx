import { useState, useMemo } from "react";
import { useProducts } from "../queries";

function useDebounced<T>(value: T, delay = 400) {
    const [v, setV] = useState(value);
    useMemo(() => {
        const id = setTimeout(() => setV(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return v;
}

export default function ProductsPage() {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounced(search, 400);

    const { data, isLoading, isFetching, error } = useProducts({
        page,
        size,
        search: debouncedSearch,
    });

    const items = data?.data ?? [];
    const total = data?.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / size));

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Products</h1>

            {/* Поиск */}
            <div className="flex gap-2">
                <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Search by title or SKU…"
                    value={search}
                    onChange={(e) => {
                        setPage(0); // сброс на первую страницу при новом поиске
                        setSearch(e.target.value);
                    }}
                />
                <select
                    className="border rounded px-2"
                    value={size}
                    onChange={(e) => {
                        setPage(0);
                        setSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                            {n}/page
                        </option>
                    ))}
                </select>
            </div>

            {/* Состояния загрузки/ошибок */}
            {isLoading && <div>Загрузка…</div>}
            {error && (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <div className="text-red-600">Ошибка: {(error as any).message ?? "unknown"}</div>
            )}

            {/* Пусто */}
            {!isLoading && !error && items.length === 0 && (
                <div className="text-gray-500">Ничего не найдено.</div>
            )}

            {/* Список карточек */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>

            {/* Пагинация */}
            {total > 0 && (
                <div className="flex items-center gap-3">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage((x) => Math.max(0, x - 1))}
                        disabled={page === 0 || isFetching}
                    >
                        ← Prev
                    </button>
                    <span className="text-sm">
                        Page {page + 1} / {pages} {isFetching && "(updating…)"}
                    </span>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage((x) => Math.min(pages - 1, x + 1))}
                        disabled={page >= pages - 1 || isFetching}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

function ProductCard({
    product,
}: {
    product: {
        id: string;
        config_sku?: string;
        title: string;
        shop_link: string;
        images: string[];
    };
}) {
    const img = product.images?.[0] ?? "";
    return (
        <a
            href={product.shop_link}
            target="_blank"
            rel="noreferrer"
            className="border rounded-lg p-3 hover:shadow transition block"
        >
            <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-2 flex items-center justify-center">
                {img ? (
                    <img
                        src={img}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="text-gray-400 text-sm">no image</div>
                )}
            </div>
            <div className="text-sm text-gray-500">{product.config_sku ?? "—"}</div>
            <div className="font-medium">{product.title}</div>
        </a>
    );
}
