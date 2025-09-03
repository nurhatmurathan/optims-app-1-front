import { Input } from "antd";
import type { FC } from "react";

interface SearchInputProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    onEnterPress?: () => void;
}

export const SearchInput: FC<SearchInputProps> = ({
    searchValue,
    setSearchValue,
    onEnterPress,
}) => {
    return (
        <Input
            allowClear
            placeholder="Поиск"
            value={searchValue}
            className="md:!min-w-[220px] md:max-w-[220px] md:w-auto w-full"
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={onEnterPress}
        />
    );
};
