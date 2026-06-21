import { Terminal } from '@/components/Terminal';

export function TerminalPage() {
	return (
		<section className="flex h-[calc(100vh-100px)] w-full flex-1 flex-col items-center justify-center">
			<Terminal />
		</section>
	);
}
