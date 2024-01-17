import type { BoardInfo, Color, Move } from '$lib/misc'
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
  pickedPiece?: number
} & BoardInfo

const moveHistory = writable<moveHistoryType[]>([])

export default moveHistory
