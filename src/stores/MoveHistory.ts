import type { BoardInfo } from '$lib/misc'
import { writable } from 'svelte/store'


export type moveHistoryType = {
  turn: Color,
  lastMove: number[],
  startTile: number,
  targetTile: number,
  pieceToMove: number,
  pieceTarget: number
} & BoardInfo

const moveHistory = writable<moveHistoryType[]>([])

export default moveHistory
