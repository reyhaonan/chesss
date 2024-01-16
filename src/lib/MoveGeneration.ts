import { type Move, type CastlingRightsType, PieceType, direction, numberOfTilesToEdge, type Color } from "./misc";
import { Piece } from "$lib/Piece";

export const generateCastlingMove = (
	tileIndex: number,
	piece: number,
	currentBoardArray: Map<number, number>,
	currentThreatMoveList: Move[],
	currentCastlingRights: CastlingRightsType
): Move[] => {
	const friendlyColor = piece < 16 ? 'White' : 'Black';

	const tempMoveList: Move[] = [];

	let castlingSide: ["kingSide" | "queenSide", number, number][] = [
		["kingSide", 1, 3],
		["queenSide", -1, 4]
	];
	// Combine kingside and queenside checks for efficiency
	for (const [side, direction, rookOffset] of castlingSide) {
		if (currentCastlingRights[friendlyColor][side]) {
			let isValid = true;

			for (let i = 0; i < rookOffset + 1 && isValid; i++) {
				const offset = i * direction;

				// Check for targeted squares
				if (i < rookOffset) {
					isValid = isValid && !currentThreatMoveList.some((e) => e.target === tileIndex + offset);
				}

				// Check for empty squares and correct rook
				if (i > 0 && i < rookOffset) {
					isValid = isValid && !currentBoardArray.get(tileIndex + offset);
				} else if (i === rookOffset) {
					isValid =
						isValid &&
						Piece.isType(currentBoardArray.get(tileIndex + offset), PieceType.Rook) &&
						Piece.sameColor(currentBoardArray.get(tileIndex + offset), friendlyColor);
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
	currentBoardArray: Map<number, number>,
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
			let targetPiece = currentBoardArray.get(targetTile);

			if (currentEnPassantTarget !== targetTile) {
				// Break out of the loop if diagonal space isnt opponent piece or the space is empty
				if ((!targetPiece || Piece.sameColor(targetPiece, friendlyColor)) && i !== 1)
					break;

				// if target piece isnt empty, break out of the loop of forward is blocked, or diagonal is occupied by friendlies
				if (!!targetPiece && (i === 1 || Piece.sameColor(targetPiece, friendlyColor)))
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
	currentBoardArray: Map<number, number>
): Move[] => {
	// -17: 2 north, 1 west, 0 ,3
	// -15: 2 north, 1 east, 0, 1
	// -10: 2 west, 1 north, 3, 0
	// -6: 2 east, 1 north, 1, 0
	// 6: 2 west, 1 south, 3, 2
	// 10: 2 east, 1 south, 1, 2
	// 15: 2 south, 1 west, 2, 3
	// 17: 2 south, 1 east,	2, 1

	let d = numberOfTilesToEdge[tileIndex];

	const knightNumberOfTilesToEdge = [
		[d[0], d[3]],
		[d[0], d[1]],
		[d[3], d[0]],
		[d[1], d[0]],
		[d[3], d[2]],
		[d[1], d[2]],
		[d[2], d[3]],
		[d[2], d[1]]
	];

	const knightMoveOffsets = [-17, -15, -10, -6, 6, 10, 15, 17];

	let tempMoveList: Move[] = [];

	let friendlyColor: Color = piece < 16 ? 'White' : 'Black';

	for (let i = 0; i < knightMoveOffsets.length; i++) {
		const targetTile = tileIndex + knightMoveOffsets[i];
		// Ensure the target tile is within bounds
		if (knightNumberOfTilesToEdge[i][0] >= 2 && knightNumberOfTilesToEdge[i][1] >= 1) {
			const targetPiece = currentBoardArray.get(targetTile);
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
	currentBoardArray: Map<number, number>
): Move[] => {
	let tempMoveList: Move[] = [];

	let friendlyColor: Color = piece < 16 ? 'White' : 'Black';
	let opponentColor: Color = piece < 16 ? 'Black' : 'White';

	let startDirectionIndex = Piece.isType(piece, PieceType.Bishop) ? 4 : 0;
	let endDirectionIndex = Piece.isType(piece, PieceType.Rook) ? 4 : 8;

	for (
		let directionIndex = startDirectionIndex;
		directionIndex < endDirectionIndex;
		directionIndex++
	) {
		for (let j = 0; j < numberOfTilesToEdge[tileIndex][directionIndex]; j++) {
			// if its a king
			if (Piece.isType(piece, PieceType.King) && j >= 1) break;

			let targetTile = tileIndex + direction[directionIndex] * (j + 1);

			let targetPiece = currentBoardArray.get(targetTile);

			// Same color piece
			if (!!targetPiece && Piece.sameColor(targetPiece, friendlyColor)) {
				break;
			}

			tempMoveList.push({ start: tileIndex, target: targetTile });

			// Different color piece
			if (!!targetPiece && Piece.sameColor(targetPiece, opponentColor)) {
				break;
			}
		}
	}

	return tempMoveList;
};

