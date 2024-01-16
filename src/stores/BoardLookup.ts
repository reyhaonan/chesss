import { writable } from 'svelte/store'

const boardLookup = writable({current:-1, lookup: -1})

export default boardLookup
