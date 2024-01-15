import { direction, alphabet, type BoardHistory, type BoardInfo, type CastlingRightsType, type Color, type Move, rankLookup, FENRegex, } from './misc';

// export const generateMoves = (piece: ) => {}

export const convertFENToBoardArray = (FEN: string):[number[], Color, CastlingRightsType, number | null, number, number] => {

	if(!FENRegex.test(FEN)){
		throw new Error("Invalid FEN String: " + FEN)
	}

	const boardArray: number[] = [];

	let newTurn: Color,
		newCastlingRights: CastlingRightsType = [false, false, false, false], 
		newEnPassantTarget: number | null,
		newHalfMoveClock: number,
		newFullMoveClock: number

	let [boardInfo, turn, castlingRights, enPassantTarget, halfMoveClock, fullMoveClock] = FEN.split(" ")

	// 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

	// Board Array
	boardInfo
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

	// Turn
	newTurn = turn === "w" ? "White":"Black"

	// Castling Rights
	for(const char of castlingRights){
		switch(char){
			case 'K':
					newCastlingRights[0] = true
			case 'Q':
					newCastlingRights[1] = true
			case 'k':
					newCastlingRights[2] = true
			case 'q':
					newCastlingRights[3] = true
		}
	}

	// TODO: Convert position to number
	// En Passant
	newEnPassantTarget = enPassantTarget === "-"? null: 0

	// Half Move Clock
	newHalfMoveClock = Number(halfMoveClock)
	
	// Full Move Clock
	newFullMoveClock = Number(fullMoveClock)

	return [boardArray, newTurn, newCastlingRights, newEnPassantTarget, newHalfMoveClock, newFullMoveClock];
};

export const convertNumberToAlgebraicNotation = (coord: number): string => {
	const rank = Piece.getRank(coord);
  const file = Piece.getFile(coord);

	if (rank < 0 || rank > 7 || file < 0 || file > 7) {
    throw new Error("Invalid board coordinate: " + coord);
  }

	return `${alphabet[rank]}${(file + 1)}`
}

export const convertAlgebraicNotationToNumber = (coord: string):number => {
	const [rankChar, fileStr] = coord;

  const rank = rankLookup[rankChar.toLowerCase()];
  const file = Number(fileStr) - 1;

  if (rank === undefined || isNaN(file)) {
    throw new Error("Invalid algebraic notation: " + coord);
  }

  return rank + file * 8;
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


export const generateMoves = (
	currentBoardArray: number[], 
	currentTurn: Color, 
	currentFutureMoveList: Move[], 
	currentCastlingRights: CastlingRightsType, 
	currentEnPassantTarget:number|null, 
	currentHalfMoveClock:number,
	currentFullMoveList:number,
	futureCheck:number
) : Move[] => {

	let tempMoveList:Move[] = []

	for(let i = 0;i < 64;i++){
		let piece = currentBoardArray[i];
		
		// this piece turn
		if(Piece.sameColor(piece, currentTurn)){
			
			if(Piece.isType(piece, Piece.Pawn)){
				tempMoveList.push(...generatePawnMove(i, piece, currentBoardArray, currentEnPassantTarget))
			}
			else if(Piece.isType(piece, Piece.Knight)){
				tempMoveList.push(...generateKnightMove(i, piece,  currentBoardArray))
			}
			else if(Piece.isType(piece, Piece.King)){
				tempMoveList.push(...generateCastlingMove(i, piece, currentBoardArray, currentFutureMoveList ,currentCastlingRights))
				tempMoveList.push(...generateSlidingMove(i, piece, currentBoardArray))
			}
			else {
				tempMoveList.push(...generateSlidingMove(i, piece, currentBoardArray))
			}
		}
	}

	if(futureCheck > 0)tempMoveList = tempMoveList.filter((move) => {
		
		let {newBoardArray, newEnPassantTarget, newTurn, newCastlingRights, newHalfMoveClock, newFullMoveClock} = executeMove([...currentBoardArray], move, currentTurn,{...currentCastlingRights}, currentEnPassantTarget, currentHalfMoveClock, currentFullMoveList)
		
		// Filter out movement that would result in king getting targetted
		return move.target >= 0 && move.target < 64 && !generateMoves([...newBoardArray], newTurn, currentFutureMoveList, {...newCastlingRights}, newEnPassantTarget, newHalfMoveClock, newFullMoveClock, --futureCheck).some(move => Piece.isType(newBoardArray[move.target], Piece.King) && Piece.sameColor(newBoardArray[move.target], currentTurn))
	})



	return tempMoveList
}



export const generateCastlingMove = (
	tileIndex: number,
	piece: number,
	currentBoardArray: number[],
	currentThreatMoveList: Move[],
	currentCastlingRights: CastlingRightsType
): Move[] => {
	const friendlyColor = piece < 16 ? 'White' : 'Black';

	const tempMoveList: Move[] = [];

	let castlingSide: [number, number, number][] = [
		[0, 1, 3],
		[1, -1, 4]
	];

	let castlingRightsAddress = friendlyColor === 'White' ? [0, 1] : [2, 3];

	// Combine kingside and queenside checks for efficiency
	for (const [side, direction, rookOffset] of castlingSide) {
		if (currentCastlingRights[castlingRightsAddress[side]]) {
			let isValid = true;

			for (let i = 0; i < rookOffset + 1 && isValid; i++) {
				const offset = i * direction;

				// Check for targeted squares
				if (i < rookOffset) {
					isValid = isValid && !currentThreatMoveList.some((e) => e.target === tileIndex + offset);
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


export const executeMove = (
	currentBoardArray: number[],
	move: Move,
	currentTurn: Color,
	currentCastlingRights: CastlingRightsType,
	currentEnPassantTarget: number | null,
	currentHalfMoveClock: number,
	currentFullMoveClock: number,
	pickedPiece?: number
): BoardInfo => {
	let { start: startTile, target: targetTile, note } = move;

	let pieceToMove = currentBoardArray[startTile];

	let friendlyColor: Color = pieceToMove < 16 ? 'White' : 'Black';
	let opponentColor: Color = pieceToMove < 16 ? 'Black' : 'White';

	let targetPiece = currentBoardArray[targetTile];

	let enPassantPotential = null;

	let castlingRightsAddress = friendlyColor === 'White' ? [0, 1] : [2, 3];
	let opponentCastlingRightsAddress = friendlyColor === 'White' ? [2, 3] : [0, 1];

	// Add halfMove by one if it isnt a capture, reset to zero if it is a capture
	currentHalfMoveClock = targetPiece === Piece.None ? ++currentHalfMoveClock : 0;

	// Specialized move check
	if (Piece.isType(pieceToMove, Piece.Pawn)) {
		// Pawn capture reset half move clock
		currentHalfMoveClock = 0;
		if (pickedPiece) pieceToMove = pickedPiece;

		/* -------------------------------------------------------------------------- */
		/*                                 En Passant                                 */
		/* -------------------------------------------------------------------------- */
		// Set potential en passant target
		if (Math.abs(targetTile - startTile) === 16)
			enPassantPotential = targetTile - (targetTile - startTile) / 2;
		// Google en passant
		else if (targetTile === currentEnPassantTarget) {
			let holyHell = friendlyColor === 'White' ? 8 : -8;
			currentBoardArray[targetTile + holyHell] = Piece.None;
		}
	} else if (Piece.isType(pieceToMove, Piece.King)) {
		/* -------------------------------------------------------------------------- */
		/*                                  Castling                                  */
		/* -------------------------------------------------------------------------- */
		// Check if move is kingside castling
		if (note?.[friendlyColor] === 'kingSide') {
			currentBoardArray[startTile + 1] = currentBoardArray[startTile + 3];
			currentBoardArray[startTile + 3] = Piece.None;

			currentCastlingRights[castlingRightsAddress[0]] = false;
		}
		// Check if move is queenside castling
		else if (note?.[friendlyColor] === 'queenSide') {
			currentBoardArray[startTile - 1] = currentBoardArray[startTile - 4];
			currentBoardArray[startTile - 4] = Piece.None;

			currentCastlingRights[castlingRightsAddress[1]] = false;
		}
		// Neither? then provoke all castling side
		else {
			currentCastlingRights[castlingRightsAddress[0]] = false;
			currentCastlingRights[castlingRightsAddress[1]] = false;
		}
	} else if (Piece.isType(pieceToMove, Piece.Rook)) {
		/* -------------------------------------------------------------------------- */
		/*                             Castling Invalidate                            */
		/* -------------------------------------------------------------------------- */
		if (Piece.getRank(startTile) === 7) currentCastlingRights[castlingRightsAddress[0]] = false;
		else if (Piece.getRank(startTile) === 0)
			currentCastlingRights[castlingRightsAddress[1]] = false;
	}

	// Taking rook castle so revoke the rights
	if (Piece.isType(targetPiece, Piece.Rook)) {
		if (Piece.getRank(targetTile) === 7)
			currentCastlingRights[opponentCastlingRightsAddress[0]] = false;
		else if (Piece.getRank(targetTile) === 0)
			currentCastlingRights[opponentCastlingRightsAddress[1]] = false;
	}

	// Execute actual Moves
	currentBoardArray[targetTile] = pieceToMove;
	currentBoardArray[startTile] = Piece.None;

	
	if(currentTurn === "Black")currentFullMoveClock

	return {
		newBoardArray: currentBoardArray,
		newTurn: currentTurn === "White"?"Black":"White",
		newEnPassantTarget: enPassantPotential,
		newCastlingRights: currentCastlingRights,
		newHalfMoveClock: currentHalfMoveClock,
		newFullMoveClock: currentFullMoveClock
	};
};

export const isThreefoldRepetition = (array: BoardHistory[]): boolean => {
	const seenArrays = new Map<string, number>();

	for (const innerArray of array) {
		const arrayString = JSON.stringify(innerArray);

		const count = seenArrays.get(arrayString) || 0;
		seenArrays.set(arrayString, count + 1);

		if (count + 1 === 3) {
			return true;
		}
	}

	return false;
};
