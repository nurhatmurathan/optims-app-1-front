import React from "react";
import { Button, Tag, Typography, Image, Space } from "antd";
import { LinkOutlined, CopyOutlined } from "@ant-design/icons";
import type { ProductDetailType } from "@/types";
import { KASPI_SHOP_URL } from "@/config";

const { Title, Text } = Typography;

export type ProductDetailViewProps = {
    data: ProductDetailType;
    onCopySku?: (sku: string) => void;
    onOpenShop?: (href: string) => void;
};

export const ProductDetailView: React.FC<ProductDetailViewProps> = React.memo(
    ({ data, onCopySku, onOpenShop }) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Галерея */}
                <div className="md:col-span-1">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {data.images?.length ? (
                            data.images.map((src, i) => (
                                <Image
                                    key={i}
                                    src={src}
                                    width={120}
                                    height={120}
                                    className="rounded-lg object-cover"
                                    placeholder
                                />
                            ))
                        ) : (
                            <div className="w-full flex items-center justify-center">
                                <Text type="secondary">Нет изображений</Text>
                            </div>
                        )}
                    </div>
                </div>

                {/* Основная информация */}
                <div className="md:col-span-2 space-y-3">
                    <Title level={4} className="!mb-0">
                        {data.title}
                    </Title>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                            <Text type="secondary">ID:</Text>
                            <div>{data.id}</div>
                        </div>

                        <div>
                            <Text type="secondary">SKU:</Text>
                            <div className="flex items-center gap-2">
                                <span>{data.config_sku ?? "—"}</span>
                                {data.config_sku && (
                                    <Button
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => onCopySku?.(data.config_sku!)}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <Text type="secondary">Бренд:</Text>
                            <div>{data.brand ?? "—"}</div>
                        </div>

                        <div>
                            <Text type="secondary">Категория (ID):</Text>
                            <div>{data.category_id}</div>
                        </div>
                    </div>

                    <div>
                        <Text type="secondary">Категории:</Text>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {(data.categories ?? []).map((c, i) => (
                                <Tag key={i}>{c}</Tag>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Text type="secondary">Коды категорий:</Text>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {(data.category_codes ?? []).map((c, i) => (
                                <Tag color="blue" key={i}>
                                    {c}
                                </Tag>
                            ))}
                        </div>
                    </div>

                    <Space>
                        <Button
                            type="primary"
                            icon={<LinkOutlined />}
                            onClick={() => {
                                if (data.shop_link) {
                                    onOpenShop?.(KASPI_SHOP_URL + data.shop_link);
                                }
                            }}
                        >
                            Открыть на площадке
                        </Button>
                    </Space>
                </div>
            </div>
        );
    },
);
