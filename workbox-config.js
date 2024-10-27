import {generateSW} from 'workbox-build';

generateSW({
	globDirectory: 'build/',
	globPatterns: [
		'**/*.{css,js,json,html,png,ico,svg,txt,webp}'
	],
	swDest: 'build/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
});