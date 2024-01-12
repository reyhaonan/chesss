import { direction, type CastlingRightsType, type Color, type Move } from './misc';

// export const generateMoves = (piece: ) => {}

export const convertFENToBoardArray = (FEN: string) => {
	const boardArray: number[] = [];

	FEN.split(' ')[0]
		.split('/')
		.forEach((rank) => {
			rank.split('').forEach((piece) => {
				let color: number = piece == piece.toUpperCase() ? Piece.White : Piece.Black;

				switch (piece.toLowerCase()) {
					case 'k':
						boardArray.push(Piece.King + color);
						break;
					case 'p':
						boardArray.push(Piece.Pawn + color);
						break;
					case 'n':
						boardArray.push(Piece.Knight + color);
						break;
					case 'b':
						boardArray.push(Piece.Bishop + color);
						break;
					case 'r':
						boardArray.push(Piece.Rook + color);
						break;
					case 'q':
						boardArray.push(Piece.Queen + color);
						break;

					default:
						boardArray.push(...Array(Number(piece)).fill(Piece.None));
				}
			});
		});

	return boardArray;
};

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

export const Piece = {
	None: 0,
	King: 1,
	Pawn: 2,
	Knight: 3,
	Bishop: 4,
	Rook: 5,
	Queen: 6,

	// 9 is White king
	// 14 is White queen
	// 17 is Black king
	// 22 is Black queen
	White: 8,
	Black: 16,

	sameColor: (piece: number, color: Color) => {
		if (piece === Piece.None) return false;
		// black                       or  white
		return (piece > 16 && color == 'Black') || (piece < 16 && color == 'White');
	},

	/**
	 *
	 * @param piece
	 * @param pieceTypeToCompare
	 * @returns boolean
	 */
	isType: (piece: number, pieceTypeToCompare: number) => {
		if (piece === Piece.None) return piece === pieceTypeToCompare;
		return piece - Piece.Black === pieceTypeToCompare || piece - Piece.White === pieceTypeToCompare;
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
	getRank: (tileNumber: number) => tileNumber % 8
};

export const generateCastlingMove = (
	tileIndex: number,
	piece: number,
	currentBoardArray: number[],
	currentFutureMoveList: Move[],
	currentCastlingRights: CastlingRightsType
): Move[] => {
	const friendlyColor = piece < 16 ? 'White' : 'Black';

	const tempMoveList: Move[] = [];

	let castlingSide: ['queenSide' | 'kingSide', number, number][] = [
		['kingSide', 1, 3],
		['queenSide', -1, 4]
	];

	// Combine kingside and queenside checks for efficiency
	for (const [side, direction, rookOffset] of castlingSide) {
		if (currentCastlingRights[friendlyColor][side]) {
			let isValid = true;

			for (let i = 0; i < rookOffset + 1 && isValid; i++) {
				const offset = i * direction;

				// Check for targeted squares
				if (i < rookOffset) {
					isValid = isValid && !currentFutureMoveList.some((e) => e.target === tileIndex + offset);
				}

				// Check for empty squares and correct rook
				if (i > 0 && i < rookOffset) {
					isValid = isValid && currentBoardArray[tileIndex + offset] === Piece.None;
				} else if (i === rookOffset) {
					isValid =
						isValid &&
						Piece.isType(currentBoardArray[tileIndex + offset], Piece.Rook) &&
						Piece.sameColor(currentBoardArray[tileIndex + offset], friendlyColor);
				}
			}

			if (isValid) {
				tempMoveList.push({
					start: tileIndex,

					target: tileIndex + 2 * direction,
					note: { [friendlyColor]: side }
				});
			}
		}
	}

	return tempMoveList;
};

export const generatePawnMove = (
	tileIndex: number,
	piece: number,
	currentBoardArray: number[],
	currentEnPassantTarget: number | null
): Move[] => {
	let friendlyColor: Color = piece < 16 ? 'White' : 'Black';

	let tempMoveList: Move[] = [];

	let isOnStartingLine = Piece.sameColor(piece, 'White')
		? Piece.getFile(tileIndex) === 6
		: Piece.getFile(tileIndex) === 1;

	let limit = isOnStartingLine ? 2 : 1;

	let pieceTarget = Piece.sameColor(piece, 'White') ? [4, 0, 5] : [7, 2, 6];

	// direction top left, top, top right for white
	// direction bottom left, bottom , bottom right for black
	for (let i = 0; i < 3; i++) {
		let maxStep = i === 1 ? limit : 1;

		// continue to the next loop if the edge is in the way
		if (numberOfTilesToEdge[tileIndex][pieceTarget[i]] === 0) continue;

		for (let step = 1; step <= maxStep; step++) {
			let targetTile = tileIndex + direction[pieceTarget[i]] * step;
			let targetPiece = currentBoardArray[targetTile];

			if (currentEnPassantTarget !== targetTile) {
				// Break out of the loop if diagonal space isnt opponent piece or the space is empty
				if ((targetPiece === Piece.None || Piece.sameColor(targetPiece, friendlyColor)) && i !== 1)
					break;

				// if target piece isnt empty, break out of the loop of forward is blocked, or diagonal is occupied by friendly
				if (targetPiece !== Piece.None && (i === 1 || Piece.sameColor(targetPiece, friendlyColor)))
					break;
			}

			tempMoveList.push({
				start: tileIndex,
				target: targetTile,
				note: currentEnPassantTarget === targetTile ? 'enPassant' : undefined
			});
		}
	}

	return tempMoveList;
};

// fix this
export const generateKnightMove = (
	tileIndex: number,
	piece: number,
	currentBoardArray: number[]
): Move[] => {
	const knightMoveOffsets = [-17, -15, -6, 10, 17, 15, 6, -10];

	let tempMoveList: Move[] = [];

	let friendlyColor: Color = piece < 16 ? 'White' : 'Black';

	for (let i = 0; i < knightMoveOffsets.length; i++) {
		const targetTile = tileIndex + knightMoveOffsets[i];

		// Ensure the target tile is within bounds
		if (numberOfTilesToEdge[tileIndex][Math.floor(i / 2)] >= 2) {
			const targetPiece = currentBoardArray[targetTile];

			// Knight can jump over pieces, so only check for friendly pieces
			if (!Piece.sameColor(targetPiece, friendlyColor)) {
				tempMoveList.push({ start: tileIndex, target: targetTile });
			}
		}
	}

	return tempMoveList;
};

export const generateSlidingMove = (
	tileIndex: number,
	piece: number,
	currentBoardArray: number[]
): Move[] => {
	let tempMoveList: Move[] = [];

	let friendlyColor: Color = piece < 16 ? 'White' : 'Black';
	let opponentColor: Color = piece < 16 ? 'Black' : 'White';

	let startDirectionIndex = Piece.isType(piece, Piece.Bishop) ? 4 : 0;
	let endDirectionIndex = Piece.isType(piece, Piece.Rook) ? 4 : 8;

	for (
		let directionIndex = startDirectionIndex;
		directionIndex < endDirectionIndex;
		directionIndex++
	) {
		for (let j = 0; j < numberOfTilesToEdge[tileIndex][directionIndex]; j++) {
			// if its a king
			if (Piece.isType(piece, Piece.King) && j >= 1) break;

			let targetTile = tileIndex + direction[directionIndex] * (j + 1);

			let targetPiece = currentBoardArray[targetTile];

			// Same color piece
			if (targetPiece !== Piece.None && Piece.sameColor(targetPiece, friendlyColor)) {
				break;
			}

			tempMoveList.push({ start: tileIndex, target: targetTile });

			// Different color piece
			if (targetPiece !== Piece.None && Piece.sameColor(targetPiece, opponentColor)) {
				break;
			}
		}
	}

	return tempMoveList;
};
