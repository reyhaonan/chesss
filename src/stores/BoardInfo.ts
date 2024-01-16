import type { BoardInfoArray } from '$lib/misc'
import { writable } from 'svelte/store'

const boardInfo = writable<BoardInfoArray>()

export default boardInfo
