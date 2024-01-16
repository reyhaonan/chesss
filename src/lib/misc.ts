/**
 * rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
 */
export const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

enum Direction {
	TopLeft = -9,
	Top = -8,
	TopRight = -7,
	Left = -1,
	Right = 1,
	BottomLeft = 7,
	Bottom = 8,
	BottomRight = 9
}

export const direction = [
	// Vertical and horizontal
	Direction.Top,
	Direction.Right,
	Direction.Bottom,
	Direction.Left,

	// Diagonal
	Direction.TopLeft,
	Direction.TopRight,
	Direction.BottomRight,
	Direction.BottomLeft
];

export type Move = {
	start: number;
	target: number;
	note?: any;
};


export enum PieceType {
  None,
  King,
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
}

export enum PieceColor {
  White = 8,
  Black = 16,
}



export type Color = 'White' | 'Black';

// white kingside, white queenside, black kingside, black queenside
export type CastlingRightsType = {
	White: {
		kingSide: boolean;
		queenSide: boolean;
	},
	Black: {
		kingSide: boolean;
		queenSide: boolean;
	}
}


export type BoardHistory = [Map<number, number>, CastlingRightsType, number | null]


export type BoardInfo = {
	newBoardArray: Map<number, number>;
	newTurn: Color;
	newCastlingRights: CastlingRightsType;
	newEnPassantTarget: number | null;
	newHalfMoveClock: number;
	newFullMoveClock: number;
};

export type BoardInfoArray = [Map<number, number>, Color, CastlingRightsType, number | null, number, number]

export type Alphabet = "a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"

export const alphabet: string[] = ["a","b","c","d","e","f","g","h"]

export const rankLookup:{[key:string]:number} = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };

export const filesLookup:{[key:string | number]:number} = { 8: 0, 7: 1, 6: 2, 5: 3, 4: 4, 3: 5, 2: 6, 1: 7 };

export const fileArray = [8, 7, 6, 5, 4, 3, 2, 1]


export type Num = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type AlgebraicNotation = `${Alphabet}${Num}`

export const FENRegex = /^(((?:[rnbqkpRNBQKP1-8]+\/){7})[rnbqkpRNBQKP1-8]+)\s([bw])\s([KQkq]{1,4})\s(-|[a-h][1-8])\s(\d+\s\d+)$/


export const PieceCharLookup = {
	1 : "K",
	2: "P",
	3: "N",
	4: "B",
	5: "R",
	6: "Q",
}



const generateNumberOfTilesToEdge = (): number[][] => {
	const temp: number[][] = [];

	for (let file = 0; file < 8; file++) {
		for (let rank = 0; rank < 8; rank++) {
			let nNorth = file;
			let nEast = 7 - rank;
			let nSouth = 7 - file;
			let nWest = rank;

			let tile = file * 8 + rank;

			temp[tile] = [
				nNorth,
				nEast,
				nSouth,
				nWest,
				Math.min(nNorth, nWest),
				Math.min(nNorth, nEast),
				Math.min(nSouth, nEast),
				Math.min(nSouth, nWest)
			];
		}
	}

	return temp;
};

export const numberOfTilesToEdge = generateNumberOfTilesToEdge();