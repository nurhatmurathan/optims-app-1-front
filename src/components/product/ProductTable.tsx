import type { ColumnsType } from "antd/es/table";
import { Tooltip } from "antd";
import { CustomTable } from "../common";

export interface ProductCoverType {
    id: string;
    config_sku?: string;
    title: string;
    shop_link: string;
    images: string[];
}

export interface ProductTableProps {
    /** данные текущей страницы */
    data: ProductCoverType[];
    /** всего элементов (из бэкенда) */
    total: number;
    /** номер страницы, 1-based (AntD тоже ждёт 1-based) */
    page: number;
    /** размер страницы */
    size: number;
    /** загрузка */
    loading?: boolean;
    /** коллбек при смене страницы/размера */
    onPageChange?: (page: number, size: number) => void;
    /** клик по строке (опционально) */
    onRowClick?: (record: ProductCoverType) => void;
}

/** безопасно берём первую картинку */
function firstImage(srcs: string[] | undefined): string | undefined {
    return Array.isArray(srcs) && srcs.length > 0 ? srcs[0] : undefined;
}

export function ProductTable({
    data,
    total,
    page,
    size,
    loading = false,
    onPageChange,
    onRowClick,
}: ProductTableProps) {
    const columns: ColumnsType<ProductCoverType> = [
        {
            title: "Фото",
            dataIndex: "images",
            key: "images",
            width: 88,
            align: "center",
            render: (imgs: ProductCoverType["images"]) => {
                const src = firstImage(imgs);
                return src ? (
                    // Tailwind классы для аккуратной обрезки
                    <img
                        src={src}
                        alt="product"
                        className="h-14 w-14 object-cover rounded-md border"
                    />
                ) : (
                    <div className="h-14 w-14 rounded-md border bg-gray-100" />
                );
            },
        },
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
            render: (_, record) => (
                <div className="max-w-[560px]">
                    <a
                        href={record.shop_link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                        title={record.title}
                    >
                        {record.title}
                    </a>
                    {record.config_sku ? (
                        <div className="text-xs text-gray-500 mt-0.5">SKU: {record.config_sku}</div>
                    ) : null}
                </div>
            ),
        },
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 220,
            render: (id: string) => (
                <Tooltip title="Нажми, чтобы скопировать">
                    <button
                        type="button"
                        className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
                        onClick={() => navigator.clipboard?.writeText(id)}
                    >
                        {id}
                    </button>
                </Tooltip>
            ),
        },
        {
            title: "Ссылка",
            dataIndex: "shop_link",
            key: "shop_link",
            width: 120,
            render: (href: string) => (
                <a
                    href={`https://kaspi.kz/shop${href}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs"
                >
                    Открыть
                </a>
            ),
        },
    ];

    return (
        <CustomTable<ProductCoverType>
            columns={columns}
            dataSource={data}
            loading={loading}
            defaultRowKey="id"
            // аккуратно добавим «зебру» и сохраним внешний rowClassName, если передадут
            striped
            pagination={{
                total,
                current: page,
                pageSize: size,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                onChange: (p, ps) => onPageChange?.(p, ps),
                showTotal: (t, [from, to]) => `${from}-${to} из ${t}`,
            }}
            onRow={(record) => ({
                onClick: () => onRowClick?.(record),
            })}
            locale={{ emptyText: "Нет данных" }}
        />
    );
}
