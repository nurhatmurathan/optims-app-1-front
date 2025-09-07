// SearchInput.tsx
import { Input } from "antd";
import type { FC, KeyboardEvent } from "react";

interface SearchInputProps {
    searchValue: string;
    placeholder?: string;
    setSearchValue: (value: string) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput: FC<SearchInputProps> = ({
    searchValue,
    placeholder = "Поиск",
    setSearchValue,
    onKeyDown,
}) => {
    return (
        <Input
            allowClear
            placeholder={placeholder}
            value={searchValue}
            className="md:!min-w-[220px] md:max-w-[220px] md:w-auto w-full"
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={onKeyDown}
        />
    );
};
