import { useState, useMemo, useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import {
    Button,
    Space,
    Typography,
    Empty,
    Alert,
    Divider,
    Row,
    Col,
    Switch,
    DatePicker,
    Select,
    message,
} from "antd";
import { ProductRatingsChart, SearchInput } from "@/components";
import { useProduct, type RatingsParams } from "@/queries";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import type { ProductDetailType } from "@/types";
import dayjs, { Dayjs } from "dayjs";

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const CITY_OPTIONS = [
    { label: "Алматы", value: "750000000" },
    { label: "Астана", value: "710000000" },
] satisfies Array<{ label: string; value: string }>;
const DEFAULT_CITY_ID = CITY_OPTIONS[0].value;
const getTomorrowStart = () => dayjs().add(1, "day").startOf("day");
const createRange = (monthsBack: number): [Dayjs, Dayjs] => {
    const dateFrom = dayjs().subtract(monthsBack, "month").startOf("day");
    const dateTill = getTomorrowStart();
    return [dateFrom, dateTill];
};

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [productId, setProductId] = useState<string | null>(null);

    // последний успешный результат — показываем его, пока не придёт следующий успех
    const [persisted, setPersisted] = useState<ProductDetailType | null>(null);

    // ====== ВПЛЫВАЮЩИЙ ALERT ======
    const [errVisible, setErrVisible] = useState(false);
    const [errText, setErrText] = useState<string>("");
    const hideTimerRef = useRef<number | null>(null);
    const showFloatingError = useCallback((text: string, ms = 3000) => {
        setErrText(text);
        setErrVisible(true);
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => setErrVisible(false), ms);
    }, []);
    useEffect(() => {
        return () => {
            if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        };
    }, []);
    // ================================================

    const canSearch = useMemo(() => Boolean(search.trim()), [search]);

    const submitSearch = useCallback(() => {
        if (!canSearch) return;
        const next = search.trim();
        setProductId(next);
    }, [canSearch, search]);

    const { data, isLoading, isError, error, isFetching } = useProduct(productId);

    // При успехе — обновляем persisted; при ошибке — показываем плавающий Alert, контент не трогаем
    useEffect(() => {
        if (data) {
            setPersisted((prev) => (prev?.id === data.id ? prev : data));
        } else if (isError) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const detail = (error as any)?.response?.data?.detail || "Товар с таким SKU не найден";
            showFloatingError(detail, 3000);
        }
    }, [data, isError, error, showFloatingError]);

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") submitSearch();
    };

    // ---- ЛОКАЛЬНЫЕ КОНТРОЛЫ ДЛЯ ЧАРТА ----
    const [cityId, setCityId] = useState<string>(DEFAULT_CITY_ID);
    const [promoted, setPromoted] = useState<boolean>(false);
    const [range, setRange] = useState<[Dayjs, Dayjs]>(() => createRange(1));
    const [categoryFilterId, setCategoryFilterId] = useState<number | undefined>(undefined);
    const [appliedParams, setAppliedParams] = useState<RatingsParams | undefined>(undefined);

    // Сбрасываем фильтры на дефолт ТОЛЬКО при новом успешном товаре
    useEffect(() => {
        if (!data) return;
        const [df, dt] = createRange(2);
        setCityId(DEFAULT_CITY_ID);
        setPromoted(false);
        setRange([df, dt]);
        setCategoryFilterId(undefined);
        setAppliedParams({
            session_city_id: DEFAULT_CITY_ID,
            promoted_card: false,
            date_from: df.toDate(), // 00:00
            date_till: dt.toDate(), // 00:00
            session_category_filter_id: undefined,
        });
    }, [data?.id]); // только если пришёл ИМЕННО новый продукт

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
        const [df, dt] = createRange(1);
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
            {/* ВПЛЫВАЮЩЕЕ ОКНО ОШИБКИ (Alert) */}
            {errVisible && (
                <div className="fixed right-4 top-4 z-[2500] w-[360px] max-w-[90vw]">
                    <Alert
                        type="error"
                        showIcon
                        message="Ошибка"
                        description={errText}
                        closable
                        afterClose={() => setErrVisible(false)}
                    />
                </div>
            )}

            {/* Инструкция */}
            <Paragraph>
                <Text strong>Как пользоваться:</Text> Вставьте полный <Text code>SKU</Text> товара и
                нажмите кнопку <Text strong>«Найти»</Text>
            </Paragraph>

            {/* Поиск */}
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
            </Space>

            {/* Стартовые/лоадинг состояния — только если нет сохранённого результата */}
            {!persisted && !productId && (
                <Empty
                    description="Введите SKU товара и нажмите «Найти»"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
            {(isLoading || (isFetching && productId)) && !persisted && (
                <Empty description="Загружаем данные…" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            {/* Контент последнего успешного запроса */}
            {persisted && (
                <div className="space-y-6">
                    <ProductDetailView
                        data={persisted}
                        onCopySku={async (sku) => {
                            await navigator.clipboard.writeText(sku);
                            message.success("SKU скопирован");
                        }}
                        onOpenShop={(href) => window.open(href, "_blank", "noopener,noreferrer")}
                    />

                    <Divider className="!my-0" />

                    {/* Фильтры */}
                    <div className="space-y-2">
                        <Text type="secondary">Параметры рейтинга</Text>
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} md={8}>
                                <div className="flex flex-col gap-1">
                                    <Text type="secondary" className="text-xs">
                                        Город
                                    </Text>
                                    <Select
                                        value={cityId}
                                        onChange={(value: string) => setCityId(value)}
                                        options={CITY_OPTIONS}
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            </Col>

                            <Col xs={24} md={6}>
                                <div className="flex flex-col gap-1">
                                    <Text type="secondary" className="text-xs">
                                        Реклама
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

                            <Col xs={24} md={10}>
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
                                        style={{ width: "100%" }}
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

                    {/* График */}
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
