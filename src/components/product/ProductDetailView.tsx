import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Tag, Typography, Image, Space } from "antd";
import { LinkOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";
import type { ProductDetailType } from "@/types";
import { KASPI_SHOP_URL } from "@/config";

const { Title, Text } = Typography;

export type ProductDetailViewProps = {
    data: ProductDetailType;
    onCopySku?: (sku: string) => void;
    onClose?: () => void;
    onOpenShop?: (href: string) => void;
};

// const MAIN_H = 100; // высота большой рамки
// const THUMB = 40; // размер превью

export const ProductDetailView: React.FC<ProductDetailViewProps> = React.memo(
    ({ data, onCopySku, onClose, onOpenShop }) => {
        // ---- копирование SKU с "птичкой" ----
        const [copied, setCopied] = useState(false);
        const timerRef = useRef<number | null>(null);
        useEffect(() => {
            return () => {
                if (timerRef.current) window.clearTimeout(timerRef.current);
            };
        }, [data.id]);

        const handleCopyClick = async () => {
            if (!data.config_sku || copied) return;
            try {
                await navigator.clipboard.writeText(data.config_sku);
                setCopied(true);
                onCopySku?.(data.config_sku);
                if (timerRef.current) window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => setCopied(false), 1600);
            } catch {
                /* empty */
            }
        };

        // ---- галерея с большим кадром + превью + PreviewGroup ----
        const images = data.images ?? [];
        const [active, setActive] = useState(0);
        const [previewOpen, setPreviewOpen] = useState(false);
        const [previewIndex, setPreviewIndex] = useState(0);

        useEffect(() => {
            setActive(0);
            setPreviewIndex(0);
            setPreviewOpen(false);
        }, [data.id]);

        const openPreviewAt = useCallback((idx: number) => {
            setPreviewIndex(idx);
            setPreviewOpen(true);
        }, []);

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Галерея */}
                <div className="md:col-span-1">
                    {(data.images?.length ?? 0) > 0 ? (
                        <div className="flex flex-col gap-3">
                            {/* Большой кадр: квадратная рамка + object-contain */}
                            <div
                                className="relative aspect-square rounded-lg border bg-white overflow-hidden cursor-zoom-in flex items-center justify-center w-[230px]"
                                onClick={() => openPreviewAt(active)}
                            >
                                <img
                                    src={images[active]}
                                    alt={`img-${active}`}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>

                            {/* Превьюшки: тоже квадратные рамки + object-contain */}
                            <div className="grid grid-cols-5 gap-2 md:grid-cols-8">
                                {images.map((src, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setActive(i)}
                                        onDoubleClick={() => openPreviewAt(i)}
                                        className={`relative aspect-square w-[72px] rounded-lg border bg-white overflow-hidden flex items-center justify-center
              ${i === active ? "ring-2 ring-blue-500" : ""}`}
                                    >
                                        <img
                                            src={src}
                                            alt={`thumb-${i}`}
                                            className="absolute inset-0 w-full h-full object-contain"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Невидимая коллекция для лайтбокса со стрелками */}
                            <div style={{ display: "none" }}>
                                <Image.PreviewGroup
                                    preview={{
                                        visible: previewOpen,
                                        onVisibleChange: (v) => setPreviewOpen(v),
                                        current: previewIndex,
                                        onChange: (idx) => setPreviewIndex(idx),
                                    }}
                                >
                                    {images.map((src, i) => (
                                        <Image key={`pg-${i}`} src={src} />
                                    ))}
                                </Image.PreviewGroup>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-square flex items-center justify-center border rounded-lg bg-white">
                            <Text type="secondary">Нет изображений</Text>
                        </div>
                    )}
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
                                        onClick={handleCopyClick}
                                        disabled={copied}
                                        icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                                        type={copied ? "default" : "primary"}
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
                        {onClose && <Button onClick={onClose}>Закрыть</Button>}
                    </Space>
                </div>
            </div>
        );
    },
);
