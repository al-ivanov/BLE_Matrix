import Select, { type StylesConfig } from 'react-select';

export type SelectOption = {
	value: string;
	label: string;
};

const selectStyles: StylesConfig<SelectOption, false> = {
	control: (base) => ({
		...base,
		backgroundColor: 'rgba(0, 0, 0, 0.25)',
		borderColor: 'rgba(255, 255, 255, 0.2)',
		minHeight: '38px',
	}),
	singleValue: (base) => ({
		...base,
		color: '#f8fafc',
	}),
	menu: (base) => ({
		...base,
		backgroundColor: '#1e293b',
	}),
	option: (base, state) => ({
		...base,
		backgroundColor: state.isFocused ? '#334155' : '#1e293b',
		color: '#f8fafc',
	}),
	input: (base) => ({
		...base,
		color: '#f8fafc',
	}),
	placeholder: (base) => ({
		...base,
		color: '#94a3b8',
	}),
};

type SelectFieldProps = {
	label: string;
	options: SelectOption[];
	value: SelectOption;
	onChange: (option: SelectOption) => void;
};

export function SelectField({ label, options, value, onChange }: SelectFieldProps) {
	return (
		<div className="my-2.5 flex flex-col">
			<caption className="mb-1 block w-full text-cyan-50">{label}</caption>
			<Select
				options={options}
				value={value}
				onChange={(option) => {
					if (option) {
						onChange(option);
					}
				}}
				getOptionLabel={(option) => option.label}
				getOptionValue={(option) => option.value}
				styles={selectStyles}
				classNamePrefix="ble-select"
				isSearchable={false}
			/>
		</div>
	);
}
