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

export type Color = 'White' | 'Black';

// white kingside, white queenside, black kingside, black queenside
export type CastlingRightsType = [boolean, boolean, boolean, boolean];


export type BoardHistory = [number[], CastlingRightsType, number | null]


export type BoardInfo = {
	newBoardArray: number[];
	newTurn: Color;
	newCastlingRights: CastlingRightsType;
	newEnPassantTarget: number | null;
	newHalfMoveClock: number;
	newFullMoveClock: number;
};

export type Alphabet = "a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"

export const alphabet: string[] = ["a","b","c","d","e","f","g","h"]

export const rankLookup:{[key:string]:number} = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };


export type Num = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type AlgebraicNotation = `${Alphabet}${Num}`

export const FENRegex = /^(((?:[rnbqkpRNBQKP1-8]+\/){7})[rnbqkpRNBQKP1-8]+)\s([bw])\s([KQkq]{1,4})\s(-|[a-h][1-8])\s(\d+\s\d+)$/