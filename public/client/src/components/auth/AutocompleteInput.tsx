import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegisterReturn, FieldError, UseFormSetValue } from 'react-hook-form';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

interface AutocompleteInputProps {
    label: string;
    name: string;
    register: UseFormRegisterReturn;
    setValue: UseFormSetValue<any>;
    error?: FieldError;
    placeholder?: string;
    fetchUrl?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    label,
    name,
    register,
    setValue,
    error,
    placeholder,
    fetchUrl,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [allOrganizations, setAllOrganizations] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fetch organizations (or roles) from backend on mount
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const url = fetchUrl || '/api/chapter-organizations';
                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    // support both { organizations: [...] } and { roles: [...] }
                    const list = data.organizations || data.roles || [];
                    const names = list.map((it: any) => it.name);
                    setAllOrganizations(names);
                } else {
                    console.error('Failed to fetch list from', url);
                    setAllOrganizations([]);
                }
            } catch (err) {
                console.error('Error fetching list:', err);
                setAllOrganizations([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizations();
    }, [fetchUrl]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setValue(name, value, { shouldValidate: true });

        if (value.length > 0) {
            const filtered = allOrganizations.filter(org =>
                org.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setInputValue(suggestion);
        setValue(name, suggestion, { shouldValidate: true });
        setShowSuggestions(false);
    };

    return (
        <div className="mb-4" ref={wrapperRef}>
            <label className="block text-sm font-medium text-text-primary mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    className={clsx(
                        "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm transition-colors",
                        error ? "border-status-danger" : "border-border"
                    )}
                    placeholder={isLoading ? "Loading organizations..." : placeholder}
                    value={inputValue}
                    {...register}
                    onChange={handleInputChange}
                    autoComplete="off"
                    disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-bg-card shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-border">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-bg-secondary text-text-primary"
                                onClick={() => handleSelectSuggestion(suggestion)}
                            >
                                <span className="block truncate font-normal">
                                    {suggestion}
                                </span>
                                {inputValue === suggestion && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-blue">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-status-danger">{error.message}</p>}
        </div>
    );
};

export default AutocompleteInput;
