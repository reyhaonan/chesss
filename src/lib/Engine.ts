import { direction, alphabet, type BoardHistory, type BoardInfo, type CastlingRightsType, type Color, type Move, rankLookup, FENRegex, filesLookup, fileArray, type BoardInfoArray, PieceType, PieceColor, } from './misc';
import _ from 'lodash';
// export const generateMoves = (piece: ) => {}

export const convertFENToBoardArray = (FEN: string): BoardInfoArray => {

	if(!FENRegex.test(FEN)){
		throw new Error("Invalid FEN String: " + FEN)
	}

	const boardArray = new Map<number, number>();

	let newTurn: Color,
		newCastlingRights: CastlingRightsType = {
			White: {
				kingSide: false,
				queenSide: false,
			},
			Black: {
				kingSide: false,
				queenSide: false,
			}
		}, 
		newEnPassantTarget: number | null,
		newHalfMoveClock: number,
		newFullMoveClock: number

	let [boardInfo, turn, castlingRights, enPassantTarget, halfMoveClock, fullMoveClock] = FEN.split(" ")

	// 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

	let startingIndex = 0
	// Board Array
	boardInfo
		.split('/')
		.forEach((rank) => {
			rank.split('').forEach((piece) => {
				let color: number = piece == piece.toUpperCase() ? PieceColor.White : PieceColor.Black;

				switch (piece.toLowerCase()) {
					case 'k':
						boardArray.set(startingIndex, PieceType.King + color);
						startingIndex++;
						break;
					case 'p':
						boardArray.set(startingIndex, PieceType.Pawn + color);
						startingIndex++;
						break;
					case 'n':
						boardArray.set(startingIndex, PieceType.Knight + color);
						startingIndex++;
						break;
					case 'b':
						boardArray.set(startingIndex, PieceType.Bishop + color);
						startingIndex++;
						break;
					case 'r':
						boardArray.set(startingIndex, PieceType.Rook + color);
						startingIndex++;
						break;
					case 'q':
						boardArray.set(startingIndex, PieceType.Queen + color);
						startingIndex++;
						break;
					default:
						startingIndex += Number(piece)
				}
			});
		});

		console.log("BO RESULT", _.cloneDeep(boardArray))

	// Turn
	newTurn = turn === "w" ? "White":"Black"

	// Castling Rights
	for(const char of castlingRights){
		switch(char){
			case 'K':
				newCastlingRights.White.kingSide = true
			case 'Q':
				newCastlingRights.White.queenSide = true
			case 'k':
				newCastlingRights.Black.kingSide = true
			case 'q':
				newCastlingRights.Black.queenSide = true
		}
	}

	// TODO: Convert position to number
	// En Passant
	newEnPassantTarget = enPassantTarget === "-"? null: convertAlgebraicNotationToNumber(enPassantTarget)

	// Half Move Clock
	newHalfMoveClock = Number(halfMoveClock)
	
	// Full Move Clock
	newFullMoveClock = Number(fullMoveClock)

	return [_.cloneDeep(boardArray), newTurn, newCastlingRights, newEnPassantTarget, newHalfMoveClock, newFullMoveClock];
};

export const convertNumberToAlgebraicNotation = (coord: number): string => {
	const rank = Piece.getRank(coord);
  const file = Piece.getFile(coord);

	if (rank < 0 || rank > 7 || file < 0 || file > 7) {
    throw new Error("Invalid board coordinate: " + coord);
  }

	return `${alphabet[rank]}${(fileArray[file])}`
}

export const convertAlgebraicNotationToNumber = (coord: string):number => {
	const [rankChar, fileStr] = coord;

  const rank = rankLookup[rankChar.toLowerCase()];
  const file = filesLookup[fileStr];

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


export const generateMoves = (
	currentBoardArray: Map<number, number>, 
	currentTurn: Color, 
	currentCastlingRights: CastlingRightsType, 
	currentEnPassantTarget:number|null, 
	currentHalfMoveClock:number,
	currentFullMoveList:number,

	currentFutureMoveList: Move[], 
	futureCheck:number
) : Move[] => {

	let tempMoveList:Move[] = []

	currentBoardArray = _.cloneDeep(currentBoardArray)
	currentCastlingRights = _.cloneDeep(currentCastlingRights)

	for(let i = 0;i < 64;i++){
		let piece = currentBoardArray.get(i);
		

		// this piece turn
		if(!!piece && Piece.sameColor(piece, currentTurn)){
			
			if(Piece.isType(piece, PieceType.Pawn)){
				tempMoveList.push(...generatePawnMove(i, piece, currentBoardArray, currentEnPassantTarget))
			}
			else if(Piece.isType(piece, PieceType.Knight)){
				tempMoveList.push(...generateKnightMove(i, piece,  currentBoardArray))
			}
			else if(Piece.isType(piece, PieceType.King)){
				tempMoveList.push(...generateCastlingMove(i, piece, currentBoardArray, currentFutureMoveList ,currentCastlingRights))
				tempMoveList.push(...generateSlidingMove(i, piece, currentBoardArray))
			}
			else {
				tempMoveList.push(...generateSlidingMove(i, piece, currentBoardArray))
			}
		}
	}

	if(futureCheck > 0)tempMoveList = tempMoveList.filter((move) => {
		
		let {newBoardArray, newEnPassantTarget, newTurn, newCastlingRights, newHalfMoveClock, newFullMoveClock} = executeMove(currentBoardArray, move, currentTurn,{...currentCastlingRights}, currentEnPassantTarget, currentHalfMoveClock, currentFullMoveList)
		
		// Filter out movement that would result in king getting targetted
		return move.target >= 0 && move.target < 64 && 
		!generateMoves(newBoardArray, newTurn, newCastlingRights, newEnPassantTarget, newHalfMoveClock, newFullMoveClock, currentFutureMoveList, --futureCheck)
			.some(move => Piece.isType(newBoardArray.get(move.target), PieceType.King) && Piece.sameColor(newBoardArray.get(move.target), currentTurn))
	})



	return tempMoveList
}



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


export const executeMove = (
	currentBoardArray: Map<number, number>,
	move: Move,
	currentTurn: Color,
	currentCastlingRights: CastlingRightsType,
	currentEnPassantTarget: number | null,
	currentHalfMoveClock: number,
	currentFullMoveClock: number,
	pickedPiece?: number
): BoardInfo => {
	

	currentBoardArray = _.cloneDeep(currentBoardArray)
	currentCastlingRights = _.cloneDeep(currentCastlingRights)

	let { start: startTile, target: targetTile, note } = move;

	let pieceToMove = currentBoardArray.get(startTile)!;

	let targetPiece = currentBoardArray.get(targetTile);

	let enPassantPotential = null;


	// Add halfMove by one if it isnt a capture, reset to zero if it is a capture
	currentHalfMoveClock = !targetPiece ? ++currentHalfMoveClock : 0;

	// Specialized move check


	/* -------------------------------------------------------------------------- */
	/*                                    Pawn                                    */
	/* -------------------------------------------------------------------------- */
	if (Piece.isType(pieceToMove, PieceType.Pawn)) {
		// Pawn capture reset half move clock
		currentHalfMoveClock = 0;
		if (note === 'promote') pieceToMove = pickedPiece ?? PieceType.Queen + PieceColor[currentTurn];

		/* -------------------------------------------------------------------------- */
		/*                                 En Passant                                 */
		/* -------------------------------------------------------------------------- */
		// Set potential en passant target
		if (Math.abs(targetTile - startTile) === 16)
			enPassantPotential = targetTile - (targetTile - startTile) / 2;
		// Google en passant
		else if (targetTile === currentEnPassantTarget) {
			let holyHell = currentTurn === 'White' ? 8 : -8;
			currentBoardArray.delete(targetTile + holyHell)
		}
	} 
	
	
	/* -------------------------------------------------------------------------- */
	/*                                    King                                    */
	/* -------------------------------------------------------------------------- */
	else if (Piece.isType(pieceToMove, PieceType.King)) {
		/* -------------------------------------------------------------------------- */
		/*                                  Castling                                  */
		/* -------------------------------------------------------------------------- */
		// Check if move is kingside castling
		if (note?.[currentTurn] === "kingSide") {
			currentBoardArray.set(startTile + 1, currentBoardArray.get(startTile + 3)!);
			currentBoardArray.delete(startTile + 3);

			currentCastlingRights[currentTurn].kingSide = false;
		}
		// Check if move is queenside castling
		else if (note?.[currentTurn] === "queenSide") {
			
			currentBoardArray.set(startTile - 1, currentBoardArray.get(startTile - 4)!);
			currentBoardArray.delete(startTile - 4);

			currentCastlingRights[currentTurn].queenSide = false;
		}
		// Neither? then provoke all castling side
		else {
			currentCastlingRights[currentTurn] = {
				kingSide: false,
				queenSide: false,
			}
		}
	} 
	
	/* -------------------------------------------------------------------------- */
	/*                                    Rook                                    */
	/* -------------------------------------------------------------------------- */
	else if (Piece.isType(pieceToMove, PieceType.Rook)) {
		/* -------------------------------------------------------------------------- */
		/*                             Castling Invalidate                            */
		/* -------------------------------------------------------------------------- */
		if (Piece.getRank(startTile) === 7) currentCastlingRights[currentTurn].kingSide = false;
		else if (Piece.getRank(startTile) === 0)currentCastlingRights[currentTurn].queenSide = false;
	}


	// Revoke opponent castling rights if we captured a rook
	if (Piece.isType(targetPiece, PieceType.Rook)) {
		if (Piece.getRank(targetTile) === 7)
			currentCastlingRights[currentTurn === "White"?"Black":"White"].kingSide = false;
		else if (Piece.getRank(targetTile) === 0)
			currentCastlingRights[currentTurn === "White"?"Black":"White"].queenSide = false;
	}

	// Execute actual Moves
	currentBoardArray.set(targetTile, pieceToMove)
	currentBoardArray.delete(startTile);

	
	if(currentTurn === "Black")currentFullMoveClock++

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
