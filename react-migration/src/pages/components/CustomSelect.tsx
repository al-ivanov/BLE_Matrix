import React, { useState } from 'react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface CustomSelectProps<T = string> {
  options: SelectOption<T>[];
  selectedValue: T;
  onSelect: (event: React.FormEvent) => void | Promise<void>;
  className?: string;
}

export default function CustomSelect<T extends string>(props: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  // Ищем выбранную опцию для отображения
  const selectedOption = props.options.find(
    opt => String(opt.value) === String(props.selectedValue)
  );

  return (
    <div className={`relative w-full ${props.className || ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/60 border-2 border-cyan-700 rounded-lg p-3 text-left text-white hover:border-cyan-500 transition-colors focus:outline-none focus:border-cyan-400"
      >
        {selectedOption?.label || String(props.selectedValue)}
        <svg className="w-4 h-4 ml-auto float-right opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black border-2 border-cyan-600 rounded-lg max-h-64 overflow-y-auto shadow-xl">
          {props.options.map((option) => (
            <button
              key={String(option.value)}
              onClick={() => {
                props.onSelect({ preventDefault: () => {} } as React.FormEvent);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-white hover:bg-cyan-900/50 transition-colors ${
                String(option.value) === String(props.selectedValue) ? 'bg-cyan-800/70' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
