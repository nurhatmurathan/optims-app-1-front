import { Input } from "antd";
import type { FC } from "react";

interface SearchInputProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
}

export const SearchInput: FC<SearchInputProps> = ({ searchValue, setSearchValue }) => {
    return (
        <Input
            allowClear
            placeholder="Поиск"
            value={searchValue}
            className="md:!min-w-[220px] md:max-w-[220px] md:w-auto w-full"
            onChange={(e) => {
                setSearchValue(e.target.value);
            }}
        />
    );
};
