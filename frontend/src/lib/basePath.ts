/** Vite base URL with trailing slash, e.g. `/` or `/BLE_Matrix/` */
export const basePath = import.meta.env.BASE_URL;

/** React Router basename without trailing slash */
export const routerBasename =
	basePath === '/' ? undefined : basePath.replace(/\/$/, '');
