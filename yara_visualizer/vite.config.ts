import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
/*
export default defineConfig({
	plugins: [sveltekit()]

});
*/
/** @type {import('vite').UserConfig} */
const config = {
	build: {
		sourcemap: true
	},
	plugins: [sveltekit()],
	server: {
		port: 1313,
		fs: {
			allow: ['..', '/api/file/']
		}
	},
	ssr: {
		noExternal: ['@popperjs/core']
	}
}

export default config