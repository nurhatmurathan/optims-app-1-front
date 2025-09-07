import { useState, useMemo, useCallback, type KeyboardEvent, useEffect } from "react";
import {
    Button,
    Space,
    Typography,
    Empty,
    Alert,
    message,
    Divider,
    Row,
    Col,
    Switch,
    DatePicker,
} from "antd";
import { ProductRatingsChart, SearchInput } from "@/components";
import { useProduct, type RatingsParams } from "@/queries";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import type { ProductDetailType } from "@/types";
import dayjs, { Dayjs } from "dayjs";

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const DEFAULT_CITY_ID = "750000000";

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [productId, setProductId] = useState<string | null>(null);

    const canSearch = useMemo(() => Boolean(search.trim()), [search]);
    const submitSearch = useCallback(() => {
        if (!canSearch) return;
        setProductId(search.trim());
    }, [canSearch, search]);

    const { data, isLoading, isError, error, isFetching } = useProduct(productId);

    // -------- persist last successful product + non-destructive error --------
    const [persisted, setPersisted] = useState<ProductDetailType | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            setPersisted(data); // сохраняем удачный результат
            setErrorMsg(null); // очищаем прошлую ошибку
        } else if (isError) {
            // показываем только баннер, контент оставляем прежним
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any)?.response?.data?.detail || "Товар с таким SKU не найден";
            setErrorMsg(msg);
        }
    }, [data, isError, error]);

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") submitSearch();
    };

    // ---- ЛОКАЛЬНОЕ СОСТОЯНИЕ КОНТРОЛОВ ----
    const [cityId, setCityId] = useState<string>(DEFAULT_CITY_ID);
    const [promoted, setPromoted] = useState<boolean>(false);
    const [range, setRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(1, "month").startOf("day"),
        dayjs().startOf("day"),
    ]);
    const [categoryFilterId, setCategoryFilterId] = useState<number | undefined>(undefined);

    // Параметры, по которым реально строится график (применённые)
    const [appliedParams, setAppliedParams] = useState<RatingsParams | undefined>(undefined);

    // Инициализируем фильтры ТОЛЬКО когда пришёл новый валидный продукт
    useEffect(() => {
        if (!data) return;
        const df = dayjs().subtract(1, "month").startOf("day");
        const dt = dayjs().startOf("day");

        setCityId(DEFAULT_CITY_ID);
        setPromoted(false);
        setRange([df, dt]);
        setCategoryFilterId(undefined);

        setAppliedParams({
            session_city_id: DEFAULT_CITY_ID,
            promoted_card: false,
            date_from: df.toDate(), // 00:00
            date_till: dt.toDate(), // 00:00 (инклюзив по дате на бэке)
            session_category_filter_id: undefined,
        });
    }, [data]); // <= привязка к успешным данным

    const handleCopySku = async (sku: string) => {
        await navigator.clipboard.writeText(sku);
        message.success("SKU скопирован");
    };
    const handleOpenShop = (href: string) => {
        window.open(href, "_blank", "noopener,noreferrer");
    };

    const applyFilters = () => {
        if (!range?.[0] || !range?.[1]) return;
        const df = range[0].startOf("day");
        const dt = range[1].startOf("day");
        setAppliedParams({
            session_city_id: cityId.trim(),
            promoted_card: promoted,
            date_from: df.toDate(),
            date_till: dt.toDate(),
            session_category_filter_id: categoryFilterId,
        });
    };

    const resetFilters = () => {
        const df = dayjs().subtract(1, "month").startOf("day");
        const dt = dayjs().startOf("day");
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

    const canApply = useMemo(
        () => Boolean(cityId.trim() && range?.[0] && range?.[1]),
        [cityId, range],
    );

    return (
        <div className="p-4 space-y-4">
            {/* верхний баннер об ошибке новой попытки, не прячем прежний контент */}
            {errorMsg && productId && (
                <Alert type="error" showIcon message="Не найдено" description={errorMsg} />
            )}

            {/* Объяснительный текст */}
            <Paragraph>
                <Text strong>Как пользоваться:</Text> Вставьте полный <Text code>SKU</Text> товара и
                нажмите кнопку <Text strong>«Найти»</Text>
            </Paragraph>

            {/* Поле поиска */}
            <Space wrap>
                <SearchInput
                    searchValue={search}
                    setSearchValue={setSearch}
                    onKeyDown={onKeyDown}
                    placeholder="SKU"
                />
                <Button
                    type="primary"
                    onClick={submitSearch}
                    disabled={!canSearch}
                    loading={isFetching}
                >
                    Найти
                </Button>
                {(productId || persisted) && (
                    <Button
                        onClick={() => {
                            setSearch("");
                            setProductId(null);
                            setAppliedParams(undefined);
                            setPersisted(null); // <— очищаем старые детали
                            setErrorMsg(null); // <— и ошибки тоже
                        }}
                    >
                        Очистить
                    </Button>
                )}
            </Space>

            {/* Стартовые/промежуточные состояния (не мешаемся, если у нас уже есть persisted) */}
            {!productId && !persisted && (
                <Empty
                    description="Введите SKU товара и нажмите «Найти»"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
            {(isLoading || (isFetching && productId)) && !persisted && (
                <Empty description="Загружаем данные…" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            {/* Контент по последнему успешному товару */}
            {persisted && (
                <div className="space-y-6">
                    <ProductDetailView
                        data={persisted}
                        onCopySku={handleCopySku}
                        onOpenShop={handleOpenShop}
                    />

                    <Divider className="!my-0" />

                    {/* Фильтры + график */}
                    <div className="space-y-2">
                        <Text type="secondary">Параметры рейтинга</Text>
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} md={6}>
                                <div className="flex flex-col gap-1">
                                    <Text type="secondary" className="text-xs">
                                        promoted_card
                                    </Text>
                                    <Switch
                                        checked={promoted}
                                        onChange={setPromoted}
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

                    <div>
                        {appliedParams ? (
                            <ProductRatingsChart productId={persisted.id} params={appliedParams} />
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
        </div>
    );
}
