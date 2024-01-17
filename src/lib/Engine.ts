import { generatePawnMove, generateKnightMove, generateCastlingMove, generateSlidingMove } from './MoveGeneration';
import { direction, type BoardHistory, type BoardInfo, type CastlingRightsType, type Color, type Move, rankLookup, FENRegex, type BoardInfoArray, PieceType, PieceColor, rankArray, fileLookup, fileArray, } from './misc';
import { Piece } from "$lib/Piece";
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
	const file = Piece.getFile(coord);
  const rank = Piece.getRank(coord);

	if (file < 0 || file > 7 || file < 0 || file > 7) {
    throw new Error("Invalid board coordinate: " + coord);
  }

	return `${fileArray[file]}${(rankArray[rank])}`
}

export const convertAlgebraicNotationToNumber = (coord: string):number => {
	const [fileChar, rankChar] = coord;

  const rank = rankLookup[rankChar.toLowerCase()];
  const file = fileLookup[fileChar];

  if (rank === undefined || isNaN(file)) {
    throw new Error("Invalid algebraic notation: " + coord);
  }

  return rank * 8 + file;
}

export const generateMoves = (
	currentBoardArray: Map<number, number>, 
	currentTurn: Color, 
	currentCastlingRights: CastlingRightsType, 
	currentEnPassantTarget:number|null, 
	currentHalfMoveClock:number,
	currentFullMoveList:number,

	currentThreatMoveList: Move[], 
	futureCheck:number = 1
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
				tempMoveList.push(...generateCastlingMove(i, piece, currentBoardArray, currentThreatMoveList ,currentCastlingRights))
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
		!generateMoves(newBoardArray, newTurn, newCastlingRights, newEnPassantTarget, newHalfMoveClock, newFullMoveClock, currentThreatMoveList, --futureCheck)
			.some(move => Piece.isType(newBoardArray.get(move.target), PieceType.King) && Piece.sameColor(newBoardArray.get(move.target), currentTurn))
	})



	return tempMoveList
}


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
		if (Piece.getFile(startTile) === 7) currentCastlingRights[currentTurn].kingSide = false;
		else if (Piece.getFile(startTile) === 0)currentCastlingRights[currentTurn].queenSide = false;
	}


	// Revoke opponent castling rights if we captured a rook
	if (Piece.isType(targetPiece, PieceType.Rook)) {
		if (Piece.getFile(targetTile) === 7)
			currentCastlingRights[currentTurn === "White"?"Black":"White"].kingSide = false;
		else if (Piece.getFile(targetTile) === 0)
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

export const isThreefoldRepetition = (boardHistory: BoardHistory[]): boolean => {
	const seenArrays = new Map<string, number>();

	for (const innerArray of boardHistory) {
		// console.log("threefold check", JSON.stringify([...innerArray, [...innerArray[0]]]))
		const arrayString = JSON.stringify([...innerArray, [...innerArray[0].entries()].sort()]);

		const count = seenArrays.get(arrayString) || 0;
		seenArrays.set(arrayString, count + 1);

		if (count + 1 === 3) {
			return true;
		}
	}

	return false;
};



