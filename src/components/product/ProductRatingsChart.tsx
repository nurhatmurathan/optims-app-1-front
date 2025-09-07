import React, { useMemo } from "react";
import { Empty, Spin } from "antd";
import type { ProductRatingCoverType } from "@/types";
import { useProductRatings, type RatingsParams } from "@/queries";
import { ResponsiveLine } from "@nivo/line";

type Props = { productId: string; params: RatingsParams; height?: number };

const POSITION_COLOR = "#ef4444"; // красный
const PRICE_COLOR = "#f59e0b"; // оранжевый

function computeRatingPoint(r: ProductRatingCoverType): number {
    return r.page * 12 + (r.place + 1);
}

const df = new Intl.DateTimeFormat("ru-RU", { month: "short", day: "2-digit" });
const kzt = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
});

function nicePriceTicks(min: number, max: number, count = 4): number[] {
    if (!isFinite(min) || !isFinite(max)) return [];
    if (min === max) return [min];
    const span = max - min;
    const stepRaw = span / Math.max(1, count - 1);
    const pow10 = Math.pow(10, Math.floor(Math.log10(stepRaw)));
    const steps = [1, 2, 2.5, 5, 10].map((m) => m * pow10);
    const step = steps.reduce(
        (best, s) => (Math.abs(s - stepRaw) < Math.abs(best - stepRaw) ? s : best),
        steps[0],
    );
    const first = Math.ceil(min / step) * step;
    const res: number[] = [];
    for (let v = first; v <= max + 1e-9; v += step) res.push(Math.round(v));
    return res.slice(0, count);
}

export const ProductRatingsChart: React.FC<Props> = ({ productId, params, height = 400 }) => {
    const { data, isLoading, isError } = useProductRatings(productId, params);

    const { dataSeries, rightAxis } = useMemo(() => {
        const src = (data ?? [])
            .map((d) => ({
                date: new Date(d.session_created_at as unknown as string),
                pos: computeRatingPoint(d),
                price: d.min_price ?? null,
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const posVals = src.map((d) => d.pos);
        let posMin = Math.min(...posVals),
            posMax = Math.max(...posVals);
        if (!isFinite(posMin) || !isFinite(posMax)) {
            posMin = 0;
            posMax = 1;
        }
        if (posMin === posMax) posMax = posMin + 1;

        const priceVals = src.map((d) => d.price).filter((v): v is number => v != null);
        const priceMin = Math.min(...priceVals);
        const priceMax = Math.max(...priceVals);
        const hasPrice = isFinite(priceMin) && isFinite(priceMax);

        const priceToY = (p: number) =>
            posMin + ((p - priceMin) * (posMax - posMin)) / Math.max(1, priceMax - priceMin);
        const yToPrice = (y: number) =>
            priceMin + ((y - posMin) * Math.max(1, priceMax - priceMin)) / (posMax - posMin);

        const positionSeries = { id: "Позиция", data: src.map((d) => ({ x: d.date, y: d.pos })) };
        const priceSeries = hasPrice
            ? {
                  id: "Цена (мин)",
                  data: src
                      .filter((d) => d.price != null)
                      .map((d) => ({
                          x: d.date,
                          y: priceToY(d.price as number),
                          rawPrice: d.price,
                      })),
              }
            : null;

        const rightAxis = hasPrice
            ? {
                  tickValues: nicePriceTicks(priceMin, priceMax, 4).map(priceToY),
                  format: (val: number | string | Date) => kzt.format(yToPrice(Number(val))),
              }
            : null;

        return {
            dataSeries: priceSeries ? [positionSeries, priceSeries] : [positionSeries],
            rightAxis,
        };
    }, [data]);

    if (isLoading)
        return (
            <div className="h-[280px] flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    if (isError || dataSeries[0].data.length === 0)
        return <Empty description="Нет данных для графика" />;

    return (
        // прокинем CSS-переменные для осей
        <div
            className="w-full overflow-x-auto nivo-dual-axis"
            style={{
                height,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--pos-color" as any]: POSITION_COLOR,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--price-color" as any]: PRICE_COLOR,
            }}
        >
            <ResponsiveLine
                data={dataSeries}
                margin={{ top: 20, right: 80, bottom: 28, left: 48 }}
                xScale={{ type: "time", format: "native", useUTC: false, precision: "day" }}
                xFormat={(v) => df.format(v as Date)}
                yScale={{ type: "linear", min: "auto", max: "auto", reverse: true }}
                yFormat={(v) => `${v}`}
                axisBottom={{ tickPadding: 2, tickSize: 0, format: (v) => df.format(v as Date) }}
                axisLeft={{
                    tickPadding: 6,
                    tickSize: 0,
                    legend: "Позиция",
                    legendOffset: -40,
                    legendPosition: "middle",
                }}
                axisRight={
                    rightAxis
                        ? {
                              tickPadding: 6,
                              tickSize: 0,
                              legend: "Цена (мин)",
                              legendOffset: 54,
                              legendPosition: "middle",
                              tickValues: rightAxis.tickValues as number[],
                              format: rightAxis.format as (v: number | string | Date) => string,
                          }
                        : undefined
                }
                enablePoints
                pointSize={4}
                enableGridX={false}
                enableGridY
                useMesh
                legends={[
                    {
                        anchor: "top-left",
                        direction: "row",
                        translateX: 0,
                        translateY: -12,
                        itemWidth: 110,
                        itemHeight: 18,
                        itemsSpacing: 12,
                        symbolSize: 10,
                        symbolShape: "circle",
                    },
                ]}
                // зафиксируем цвета серий
                colors={({ id }) => (id === "Позиция" ? POSITION_COLOR : PRICE_COLOR)}
                enableSlices="x"
                sliceTooltip={({ slice }) => {
                    const date = slice.points[0]?.data.x as Date;
                    return (
                        <div
                            style={{
                                background: "rgba(0,0,0,.75)",
                                color: "white",
                                padding: "6px 8px",
                                fontSize: 12,
                                borderRadius: 6,
                            }}
                        >
                            <div style={{ marginBottom: 4 }}>{df.format(date)}</div>
                            {slice.points.map((p) => {
                                const color =
                                    p.seriesId === "Позиция" ? POSITION_COLOR : PRICE_COLOR;
                                const isPrice = p.seriesId === "Цена (мин)";
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const rawPrice = (p.data as any).rawPrice;
                                return (
                                    <div
                                        key={p.id}
                                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                                    >
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 999,
                                                background: color,
                                            }}
                                        />
                                        <span style={{ color }}>
                                            {p.seriesId}:{" "}
                                            {isPrice ? kzt.format(rawPrice) : p.data.yFormatted}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            />
        </div>
    );
};
