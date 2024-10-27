<script lang="ts">
	import { page } from '$app/stores';
	import { routes } from './commonData';
</script>

<footer class="w-full px-6 py-2 flex justify-between fixed bottom-0 z-40 border-t border-gray-99 bg-slate-900 shadow-md">
	<a sveltekit:prefetch href={routes.mainPage} class:active={$page.url.pathname === routes.mainPage}>
		<span 
			class="px-2 py-1 cursor-pointer text-sm flex flex-col items-center text-center text-primary"
			aria-label="Главная"
		>
			<i class="material-icons">home</i>
			<span class="mx-1 font-roboto text-white">Главная</span>
		</span>
	</a>
	<a sveltekit:prefetch href={`/${routes.text}`} class:active={$page.url.pathname === `/${routes.text}`}>
		<span 
			class="px-2 py-1 cursor-pointer text-sm flex flex-col items-center text-center"
			aria-label="Бегущая строка"
		>
			<i class="material-icons">text_rotation_none</i>
		<span class="mx-1 font-roboto text-white">Бегущая строка</span>
		</span>
	</a>
	<a sveltekit:prefetch href={`/${routes.equalizer}`} class:active={$page.url.pathname === `/${routes.equalizer}`}>
		<span class="px-2 py-1 cursor-pointer hover:bg-indigo-600 hover:text-gray-700 text-sm flex flex-col items-center text-center">
			<i class="material-icons">equalizer</i>
			<span class="mx-1 font-roboto text-white">Eq</span>
		</span>
	</a>
	<a sveltekit:prefetch href={`/${routes.terminal}`} class:active={$page.url.pathname === `/${routes.terminal}`}>
		<span class="px-2 py-1 cursor-pointer text-sm flex flex-col items-center text-center">
			<i class="material-icons">developer_mode</i>
			<span class="mx-1 font-roboto text-white">Terminal</span>
		</span>
	</a>
</footer>

<style>
	footer {
		display: flex;
		justify-content: space-between;
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
	}

	a {
		position: relative;
	}

	a.active::before {
		--size: 8px;
		--accent-color: #817be6;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: -8px;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}
	
	.material-icons {
		color: #817be6;
	}
</style>
