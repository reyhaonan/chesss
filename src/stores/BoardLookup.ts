import { writable } from 'svelte/store';

const store = () => {
	const { subscribe, set, update } = writable({ current: -1, lookup: -1 });

	const firstPage = () =>
		update((currentBoardLookup) => {
			let { current, lookup } = currentBoardLookup;
			return { current, lookup: 0 };
		});

	const prevPage = () =>
		update((currentBoardLookup) => {
			let { current, lookup } = currentBoardLookup;
			if (lookup === 0) return currentBoardLookup;
			return { current, lookup: lookup - 1 };
		});

	const nextPage = () =>
		update((currentBoardLookup) => {
			let { current, lookup } = currentBoardLookup;
			if (current === lookup) return currentBoardLookup;
			return { current, lookup: currentBoardLookup.lookup + 1 };
		});

	const lastPage = () =>
		update((currentBoardLookup) => {
			let { current, lookup } = currentBoardLookup;
			return { current, lookup: current };
		});

	return { subscribe, set, update, nextPage, prevPage, firstPage, lastPage };
};

const boardLookup = store();

export default boardLookup;
