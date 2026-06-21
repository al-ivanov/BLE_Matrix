import { NavLink } from 'react-router-dom';
import { routes } from '@/lib/commonData';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	[
		'relative',
		isActive
			? "before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-2 before:h-2 before:rounded-full before:bg-[#817be6]"
			: '',
	].join(' ');

export function Footer() {
	return (
		<footer className="fixed bottom-0 left-0 z-40 flex w-full justify-between border-t border-gray-99 bg-slate-900 px-6 py-2 shadow-md">
			<NavLink to={routes.mainPage} className={navLinkClass} end>
				<span
					className="flex cursor-pointer flex-col items-center px-2 py-1 text-center text-sm text-primary"
					aria-label="Главная"
				>
					<i className="material-icons">home</i>
					<span className="mx-1 font-roboto text-white">Главная</span>
				</span>
			</NavLink>

			<NavLink to={`/${routes.text}`} className={navLinkClass}>
				<span
					className="flex cursor-pointer flex-col items-center px-2 py-1 text-center text-sm"
					aria-label="Бегущая строка"
				>
					<i className="material-icons">text_rotation_none</i>
					<span className="mx-1 font-roboto text-white">Бегущая строка</span>
				</span>
			</NavLink>

			<NavLink to={`/${routes.equalizer}`} className={navLinkClass}>
				<span className="flex cursor-pointer flex-col items-center px-2 py-1 text-center text-sm hover:bg-indigo-600 hover:text-gray-700">
					<i className="material-icons">equalizer</i>
					<span className="mx-1 font-roboto text-white">Eq</span>
				</span>
			</NavLink>

			<NavLink to={`/${routes.terminal}`} className={navLinkClass}>
				<span className="flex cursor-pointer flex-col items-center px-2 py-1 text-center text-sm">
					<i className="material-icons">developer_mode</i>
					<span className="mx-1 font-roboto text-white">Terminal</span>
				</span>
			</NavLink>
		</footer>
	);
}
