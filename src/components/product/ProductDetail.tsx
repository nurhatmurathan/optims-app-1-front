/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer, Button, Tag, Typography, Spin, Image, App, Empty, Space } from "antd";
import { LinkOutlined, CopyOutlined } from "@ant-design/icons";
import React from "react";
import { useProduct } from "@/queries";
import { KASPI_SHOP_URL } from "@/config";

type ProductDetailProps = {
    productId: string | null; // выбранный id (или null, если ничего не выбрано)
    open: boolean; // управляет показом панели
    onClose: () => void; // закрыть панель
};

const { Title, Text } = Typography;

export const ProductDetail: React.FC<ProductDetailProps> = React.memo(
    ({ productId, open, onClose }) => {
        const { message } = App.useApp?.() ?? { message: { success: () => {} } };
        const { data, isLoading, isError, error } = useProduct(productId);

        const copySku = async () => {
            if (!data?.config_sku) return;
            await navigator.clipboard.writeText(data.config_sku);
            message?.success?.("SKU скопирован");
        };

        return (
            <Drawer
                placement="bottom"
                height={380}
                open={open}
                onClose={onClose}
                mask={false}
                className="!rounded-t-2xl"
            >
                {(!productId || (!data && !isLoading)) && (
                    <div className="h-full flex items-center justify-center">
                        <Empty description="Выберите товар в списке" />
                    </div>
                )}

                {isLoading && (
                    <div className="h-full flex items-center justify-center">
                        <Spin size="large" />
                    </div>
                )}

                {isError && (
                    <div className="h-full flex items-center justify-center">
                        <Empty description={(error as any)?.message ?? "Ошибка загрузки"} />
                    </div>
                )}

                {!!data && (
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
                                                onClick={copySku}
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
                                            window.open(
                                                KASPI_SHOP_URL + data.shop_link,
                                                "_blank",
                                                "noopener,noreferrer",
                                            );
                                        }
                                    }}
                                >
                                    Открыть на площадке
                                </Button>
                                <Button onClick={onClose}>Закрыть</Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        );
    },
);
