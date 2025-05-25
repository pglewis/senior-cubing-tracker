import type {ChangeEvent} from 'react';

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBox({value, onChange}: SearchBoxProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search name or WCA ID"
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}