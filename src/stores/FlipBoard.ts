import { writable } from 'svelte/store';

const store = () => {
	let { update, subscribe } = writable(false);

	const switchValue = () => update((current) => !current);

	return { subscribe, update, switchValue };
};

const flipBoard = store();

export default flipBoard;
