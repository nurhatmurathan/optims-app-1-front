/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
    Drawer,
    Spin,
    Empty,
    App,
    Divider,
    Alert,
    Space,
    Typography,
    // Input,
    Switch,
    DatePicker,
    // InputNumber,
    Button,
    Row,
    Col,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useProduct } from "@/queries";
import { ProductDetailView } from "./ProductDetailView";
import { ProductRatingsChart } from "./ProductRatingsChart";
import type { RatingsParams } from "@/queries";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const DEFAULT_CITY_ID = "750000000";

type ProductDetailDrawerProps = {
    productId: string | null;
    open: boolean;
    onClose: () => void;
    height?: number;
};

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = React.memo(
    ({ productId, open, onClose, height = 800 }) => {
        const { message } = App.useApp?.() ?? { message: { success: () => {} } };
        const { data, isLoading, isError, error } = useProduct(productId);

        // ---- ЛОКАЛЬНОЕ СОСТОЯНИЕ КОНТРОЛОВ ----
        const [cityId, setCityId] = useState<string>(DEFAULT_CITY_ID);
        const [promoted, setPromoted] = useState<boolean>(false);
        const [range, setRange] = useState<[Dayjs, Dayjs]>([
            dayjs().subtract(1, "month").startOf("day"),
            dayjs().endOf("day"),
        ]);
        const [categoryFilterId, setCategoryFilterId] = useState<number | undefined>(undefined);

        // Параметры, по которым реально строится график (применённые)
        const [appliedParams, setAppliedParams] = useState<RatingsParams | undefined>(undefined);

        // Инициализация дефолтов при первом открытии
        useEffect(() => {
            if (open && productId) {
                const df = dayjs().subtract(1, "month").startOf("day");
                const dt = dayjs().endOf("day");
                setCityId(DEFAULT_CITY_ID);
                setPromoted(false);
                setRange([df, dt]);
                setCategoryFilterId(undefined);

                setAppliedParams({
                    session_city_id: DEFAULT_CITY_ID,
                    promoted_card: false,
                    date_from: df.toDate(),
                    date_till: dt.toDate(),
                    session_category_filter_id: undefined,
                });
            }
        }, [open, productId]);

        const handleCopySku = async (sku: string) => {
            await navigator.clipboard.writeText(sku);
            message?.success?.("SKU скопирован");
        };

        const handleOpenShop = (href: string) => {
            window.open(href, "_blank", "noopener,noreferrer");
        };

        // Кнопка "Применить"
        const applyFilters = () => {
            if (!range?.[0] || !range?.[1]) return;
            setAppliedParams({
                session_city_id: cityId.trim(),
                promoted_card: promoted,
                date_from: range[0].startOf("day").toDate(),
                date_till: range[1].endOf("day").toDate(),
                session_category_filter_id: categoryFilterId,
            });
        };

        // Кнопка "Сбросить"
        const resetFilters = () => {
            const df = dayjs().subtract(1, "month").startOf("day");
            const dt = dayjs().endOf("day");
            setCityId(DEFAULT_CITY_ID);
            setPromoted(false);
            setRange([df, dt]);
            setCategoryFilterId(undefined);

            setAppliedParams({
                session_city_id: DEFAULT_CITY_ID,
                promoted_card: false,
                date_from: df.toDate(),
                date_till: dt.toDate(),
                session_category_filter_id: undefined,
            });
        };

        // Делаем disabled кнопку "Применить", если нет города или дат
        const canApply = useMemo(() => {
            return Boolean(cityId.trim() && range?.[0] && range?.[1]);
        }, [cityId, range]);

        return (
            <Drawer
                placement="bottom"
                height={height}
                open={open}
                onClose={onClose}
                mask={false}
                className="!rounded-t-2xl"
            >
                {(!productId || (!data && !isLoading && !isError)) && (
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
                    <div className="space-y-6">
                        {/* Блок деталей товара */}
                        <ProductDetailView
                            data={data}
                            onCopySku={handleCopySku}
                            onOpenShop={handleOpenShop}
                            onClose={onClose}
                        />

                        <Divider className="!my-0" />

                        {/* Фильтры для графика */}
                        <div className="space-y-2">
                            <Text type="secondary">Параметры рейтинга</Text>
                            <Row gutter={[12, 12]} align="middle">
                                {/* <Col xs={24} md={6}>
                                    <div className="flex flex-col gap-1">
                                        <Text type="secondary" className="text-xs">
                                            session_city_id
                                        </Text>
                                        <Input
                                            placeholder="Введите ID города"
                                            value={cityId}
                                            onChange={(e) => setCityId(e.target.value)}
                                        />
                                    </div>
                                </Col> */}

                                <Col xs={24} md={6}>
                                    <div className="flex flex-col gap-1">
                                        <Text type="secondary" className="text-xs">
                                            promoted_card
                                        </Text>
                                        <Switch
                                            checked={promoted}
                                            onChange={(v) => setPromoted(v)}
                                            checkedChildren="Да"
                                            unCheckedChildren="Нет"
                                            style={{ maxWidth: 80 }}
                                        />
                                    </div>
                                </Col>

                                <Col xs={24} md={8}>
                                    <div className="flex flex-col gap-1">
                                        <Text type="secondary" className="text-xs">
                                            Период
                                        </Text>
                                        <RangePicker
                                            allowEmpty={[false, false]}
                                            value={range}
                                            onChange={(v) => {
                                                if (!v || !v[0] || !v[1]) return;
                                                setRange([v[0], v[1]]);
                                            }}
                                            format="DD.MM.YYYY"
                                        />
                                    </div>
                                </Col>

                                {/* <Col xs={24} md={4}>
                                    <div className="flex flex-col gap-1">
                                        <Text type="secondary" className="text-xs">
                                            session_category_filter_id
                                        </Text>
                                        <div className="flex items-center gap-2">
                                            <InputNumber
                                                style={{ width: "100%" }}
                                                placeholder="Не задан"
                                                value={categoryFilterId}
                                                onChange={(v) =>
                                                    setCategoryFilterId(
                                                        typeof v === "number" ? v : undefined,
                                                    )
                                                }
                                            />
                                            <Button
                                                size="small"
                                                onClick={() => setCategoryFilterId(undefined)}
                                            >
                                                Очистить
                                            </Button>
                                        </div>
                                    </div>
                                </Col> */}

                                <Col xs={24} md={24}>
                                    <Space>
                                        <Button
                                            type="primary"
                                            onClick={applyFilters}
                                            disabled={!canApply}
                                        >
                                            Применить
                                        </Button>
                                        <Button onClick={resetFilters}>Сбросить</Button>
                                    </Space>
                                </Col>
                            </Row>
                        </div>

                        {/* График рейтинга */}
                        <div>
                            {appliedParams ? (
                                <ProductRatingsChart productId={data.id} params={appliedParams} />
                            ) : (
                                <Alert
                                    type="info"
                                    message="Укажите параметры и нажмите «Применить», чтобы увидеть график рейтинга."
                                    showIcon
                                />
                            )}
                        </div>
                    </div>
                )}
            </Drawer>
        );
    },
);
