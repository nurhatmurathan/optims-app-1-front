/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProductRatingsChart.tsx
import React, { useMemo } from "react";
import { Empty, Spin } from "antd";
import type { ProductRatingCoverType } from "@/types";
import { useProductRatings, type RatingsParams } from "@/queries";
import { LineChart } from "@mui/x-charts";

type Props = {
    productId: string;
    params: RatingsParams;
    height?: number;
};

function computeRatingPoint(r: ProductRatingCoverType): number {
    return r.page * 12 + (r.place + 1); // rating
}

const df = new Intl.DateTimeFormat("ru-RU", { month: "short", day: "2-digit" });

export const ProductRatingsChart: React.FC<Props> = ({ productId, params, height = 280 }) => {
    const { data, isLoading, isError } = useProductRatings(productId, params);

    const points = useMemo(() => {
        const src = data ?? [];
        const arr = src.map((d) => ({
            x: new Date(d.session_created_at as unknown as string), // на бэке скорее строка → приводим к Date
            y: computeRatingPoint(d),
        }));
        arr.sort((a, b) => a.x.getTime() - b.x.getTime());
        return arr;
    }, [data]);

    if (isLoading) {
        return (
            <div className="h-[280px] flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (isError || points.length === 0) {
        return <Empty description="Нет данных для графика" />;
    }

    const xData = points.map((p) => p.x);
    const yData = points.map((p) => p.y);

    return (
        <div className="w-full overflow-x-auto">
            <LineChart
                height={height}
                xAxis={[
                    {
                        data: xData,
                        scaleType: "time",
                        valueFormatter: (v) => df.format(new Date(v as any)), // только МЕС ДЕНЬ
                    },
                ]}
                series={[
                    {
                        data: yData,
                        label: "Rating",
                        showMark: false,
                        valueFormatter: (v) => String(v),
                    },
                ]}
                // slotProps={{ legend: { hidden: true } }}
            />
        </div>
    );
};
