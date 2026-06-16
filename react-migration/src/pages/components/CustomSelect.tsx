import React, { useState } from 'react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface CustomSelectProps<T = string> {
  options: SelectOption<T>[];
  selectedValue: T;
  onSelect: (event: React.FormEvent) => void | Promise<void>;
}

export default function CustomSelect<T extends string>(props: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = props.options.find(
    opt => String(opt.value) === String(props.selectedValue)
  );

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '8px', cursor: 'pointer' }}
      >
        {selectedOption?.label || props.selectedValue}
      </button>

      {isOpen && (
        <ul style={{ 
          listStyle: 'none', 
          margin: 0, 
          padding: 0,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {props.options.map((option) => (
            <li
              key={String(option.value)}
              onClick={() => {
                props.onSelect({ preventDefault: () => {} } as React.FormEvent);
                setIsOpen(false);
              }}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: String(option.value) === String(props.selectedValue) ? '#f0f0f0' : 'transparent'
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
