import { writable } from 'svelte/store';

const theme = writable('system');
const dataTextArea = writable('');
const rulesTextArea = writable('');

export { theme, dataTextArea, rulesTextArea };