import type { BoardInfoArray } from '$lib/misc'
import { writable } from 'svelte/store'

const boardInfo = writable<BoardInfoArray>([[], "White", [false, false, false, false], null, 0, 1])

export default boardInfo
