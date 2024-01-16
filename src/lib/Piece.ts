import { PieceColor, type Color } from "./misc";

export const Piece = {
	// 9 is White king
	// 14 is White queen
	// 17 is Black king
	// 22 is Black queen

	sameColor: (piece: number | undefined, color: Color) => {
		if (!piece) return false;
		// black                       or  white
		let pieceColor = piece & PieceColor.Black ? "Black" : "White" 
		return pieceColor === color;
	},

	/**
	 *
	 * @param piece
	 * @param pieceTypeToCompare
	 * @returns boolean
	 */
		isType: (piece: number| undefined, pieceTypeToCompare: number) => {
			if (!piece) return piece === pieceTypeToCompare;
			return piece % 8 === pieceTypeToCompare;
		},

	/**
	 * return vertical index
	 * @param tileNumber
	 * @returns 0-7
	 */
	getFile: (tileNumber: number) => Math.floor(tileNumber / 8),

	/**
	 * return horizontal index
	 * @param tileNumber
	 * @returns 0-7
	 */
	getRank: (tileNumber: number) => tileNumber % 8,

	getPiece: (piece: number) => {
		return piece % 8
	}
};

