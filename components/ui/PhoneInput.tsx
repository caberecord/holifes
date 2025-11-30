"use client";
import 'react-phone-number-input/style.css'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import { forwardRef } from 'react';
import es from 'react-phone-number-input/locale/es'

interface CustomPhoneInputProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    label?: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

const CustomPhoneInput = forwardRef<HTMLInputElement, CustomPhoneInputProps>(
    ({ value, onChange, label, error, placeholder, disabled, className }, ref) => {
        return (
            <div className={`w-full ${className || ''}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <div className={`relative ${error ? 'phone-input-error' : ''}`}>
                    <PhoneInput
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        defaultCountry="CO"
                        labels={es}
                        international
                        countryCallingCodeEditable={false}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
                <style jsx global>{`
                    .PhoneInput {
                        display: flex;
                        align-items: center;
                    }
                    .PhoneInputInput {
                        flex: 1;
                        min-width: 0;
                        border: none;
                        outline: none;
                        background: transparent;
                        color: inherit;
                        height: 100%;
                    }
                    .PhoneInputCountry {
                        margin-right: 0.5rem;
                        display: flex;
                        align-items: center;
                    }
                    .phone-input-error .PhoneInput {
                        border-color: #ef4444;
                    }
                `}</style>
            </div>
        );
    }
);

CustomPhoneInput.displayName = "CustomPhoneInput";

export default CustomPhoneInput;
