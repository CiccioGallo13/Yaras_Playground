import { writable, type Writable } from 'svelte/store';
import type { GenericOperation } from '../model/model';

const theme = writable('system');
const dataTextArea = writable('');
const rulesTextArea = writable('');
const activeTab = writable('Basic');

const ruleName = writable("rule_name");
const meta: Writable<GenericOperation[]> = writable([]);
const strings: Writable<GenericOperation[]> = writable([]);
const condition: Writable<string[]> = writable([""]);
const condtionOperator: Writable<string[]> = writable([]);

export { theme, dataTextArea, rulesTextArea, activeTab, ruleName, meta, strings, condition ,condtionOperator };