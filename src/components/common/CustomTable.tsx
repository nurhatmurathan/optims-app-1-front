import React from "react";
import { Table, type TableProps } from "antd";

function cx(...classes: Array<string | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

export interface CustomTableExtraProps<T> {
    striped?: boolean;
    evenRowClassName?: string;
    oddRowClassName?: string;
    defaultRowKey?: keyof T;
}

export function CustomTable<T extends object = Record<string, unknown>>(
    props: TableProps<T> & CustomTableExtraProps<T>,
) {
    const {
        striped = true,
        evenRowClassName = "bg-white",
        oddRowClassName = "bg-[#F7F9FB]",
        defaultRowKey,
        rowClassName,
        rowKey,
        ...rest
    } = props;

    const mergedRowClassName: NonNullable<TableProps<T>["rowClassName"]> = (
        record,
        index,
        indent,
    ) => {
        const user = typeof rowClassName === "function" ? rowClassName(record, index, indent) : "";

        const zebra =
            striped && typeof index === "number"
                ? index % 2 === 0
                    ? evenRowClassName
                    : oddRowClassName
                : "";

        return cx(user, zebra);
    };

    const resolvedRowKey: TableProps<T>["rowKey"] =
        rowKey ??
        (defaultRowKey ? (record: T) => record[defaultRowKey] as unknown as React.Key : undefined);

    return <Table<T> {...rest} rowKey={resolvedRowKey} rowClassName={mergedRowClassName} />;
}
