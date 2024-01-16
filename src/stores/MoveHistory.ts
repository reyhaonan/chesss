import type { BoardInfo, Move } from '$lib/misc'
import { writable } from 'svelte/store'


export type moveHistoryType = {
  turn: Color,
  lastMove: number[],
  startTile: number,
  targetTile: number,
  note?: any,
  pieceToMove: number,
  pieceTarget: number,
  moveList: Move[],
  isCheckMate: boolean,
  threatListToOpponent: Move[],
} & BoardInfo

const moveHistory = writable<moveHistoryType[]>([])

export default moveHistory
