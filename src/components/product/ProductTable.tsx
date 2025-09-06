import type { ColumnsType } from "antd/es/table";
import { Tooltip, Image, Button } from "antd";
import { CustomTable } from "../common";
import type { ProductCoverType } from "@/types";
import { KASPI_SHOP_URL } from "@/config";

export interface ProductTableProps {
    data: ProductCoverType[];
    total: number;
    page: number;
    size: number;
    loading?: boolean;
    onPageChange?: (page: number, size: number) => void;
    hidePagination?: boolean; // default: true
    onShowDetail?: (id: string) => void; // 👈 новый проп
}

/** безопасно берём первую картинку */
function firstImage(srcs?: string[]): string | undefined {
    return Array.isArray(srcs) && srcs.length > 0 ? srcs[0] : undefined;
}

export function ProductTable({
    data,
    total,
    page,
    size,
    loading = false,
    onPageChange,
    hidePagination = true,
    onShowDetail,
}: ProductTableProps) {
    const columns: ColumnsType<ProductCoverType> = [
        {
            title: "Фото",
            dataIndex: "images",
            key: "images",
            width: 96,
            align: "center",
            render: (imgs) => {
                const src = firstImage(imgs);
                return (
                    <div className="h-16 w-16 rounded-md overflow-hidden border bg-gray-50 mx-auto">
                        {src ? (
                            <Image.PreviewGroup items={imgs}>
                                <Image
                                    width={80}
                                    height={80}
                                    loading="lazy"
                                    src={src}
                                    preview={{ mask: "." }}
                                    alt="Product"
                                />
                            </Image.PreviewGroup>
                        ) : null}
                    </div>
                );
            },
        },
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
            render: (_, record) => (
                <div className="max-w-[560px] leading-snug">
                    <a
                        href={`https://kaspi.kz/shop${record.shop_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                        title={record.title}
                    >
                        {record.title}
                    </a>
                    {record.config_sku && (
                        <div className="text-xs text-gray-500 mt-0.5">SKU: {record.config_sku}</div>
                    )}
                </div>
            ),
        },
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 200,
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
                    href={`${KASPI_SHOP_URL}${href}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs"
                >
                    Открыть
                </a>
            ),
        },
        {
            title: "Детали",
            key: "detail",
            width: 150,
            render: (_, record) => (
                <Button size="small" onClick={() => onShowDetail?.(record.id)}>
                    Подробнее
                </Button>
            ),
        },
    ];

    const visibleData = hidePagination ? data.slice(0, size) : data;

    return (
        <CustomTable<ProductCoverType>
            columns={columns}
            dataSource={visibleData}
            loading={loading}
            defaultRowKey="id"
            pagination={
                hidePagination
                    ? false
                    : {
                          total,
                          current: page,
                          pageSize: size,
                          showSizeChanger: true,
                          pageSizeOptions: [10, 20, 50],
                          onChange: (p, ps) => onPageChange?.(p, ps),
                          showTotal: (t, [from, to]) => `${from}-${to} из ${t}`,
                      }
            }
            locale={{ emptyText: "Нет данных" }}
        />
    );
}
