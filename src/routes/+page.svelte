
<div class="grid grid-cols-12">
	<div class="sidebar col-span-2">a</div>
	<main class="content col-span-8">

		<div class="w-full flex items-center justify-center my-8">

			<Board>
				<div class="absolute inset-0 grid grid-cols-8 grid-rows-8" id="board">
					{#each boardArray as pawn, i}
						<Tile pieceNumber={pawn} 
							highlightForMoveSuggestion={!!moveList.find(move => move.start === selectedTile && move.target === i)}
							highlightSelectedTile={selectedTile === i}
							on:click={
								() => {
									if(!!moveList.find(move => move.start === selectedTile && move.target === i))executeMove(selectedTile, i)
									else if(!Piece.isType(pawn, Piece.None))selectedTile = i
									else selectedTile = -1
								}
							}
							on:drop={() => {
								if(!!moveList.find(move => move.start === selectedTile && move.target === i))executeMove(selectedTile, i)
							}}
							on:dragend={() => selectedTile = -1}
							on:dragstart={() => selectedTile = i}

							turn={turn}

							debugIndex={i}
						/>
					{/each}

				</div>
			</Board>
		</div>
	</main>
	<div class="sidebar col-span-2">b</div>
</div>


<script lang="ts">
	import Board from "$components/Board.svelte";
	import Tile from "$components/Tile.svelte";
	import { convertFENToBoardArray, numberOfTilesToEdge, Piece } from "$lib/method";
	import { direction, startingFEN, type Move, type Color } from "$lib/misc";

	let boardArray = convertFENToBoardArray("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1")
	// let boardArray = convertFENToBoardArray(startingFEN)

	let turn:Color = "W";

	let moveList:Move[] = []

	let selectedTile:number = -1;

	let castlingRights = {
		W:{
			queenSide: true,
			kingSide: true
		},
		B:{
			queenSide: true,
			kingSide: true
		},
	}

	let enPassantTarget:number|null = null

	let futureMoveList: Move[] =[]

	
	$: boardArray, moveList = generateMoves(boardArray, turn)

	$: moveList, console.log("moveList",moveList)


	const generateMoves = (currentBoardArray: number[], currentTurn: Color):Move[] => {

		let tempMoveList:Move[] = []
		
		for(let i = 0;i < 64;i++){
			let piece = currentBoardArray[i];
			
			// this piece turn
			if(Piece.sameColor(piece, currentTurn)){
				
				if(Piece.isType(piece, Piece.Pawn)){
					tempMoveList.push(...generatePawnMove(i, piece, currentBoardArray))
				}
				else if(Piece.isType(piece, Piece.Knight)){
					tempMoveList.push(...generateKnightMove(i, currentBoardArray))
				}
				else if(Piece.isType(piece, Piece.King)){
					tempMoveList.push(...generateCastlingMove(i, piece, currentBoardArray))
					tempMoveList.push(...generateSlidingMove(i, piece, currentBoardArray))
				}
				else {
					tempMoveList.push(...generateSlidingMove(i, piece, currentBoardArray))
				}
			}
		}

		return tempMoveList
	}

	const executeMove = (startTile:number, targetTile:number) => {

		let pieceToMove = boardArray[startTile]

		let friendlyColor: Color = pieceToMove < 16? "W":"B"

		let lastEnPassantTarget = enPassantTarget

		enPassantTarget = null;

		boardArray[targetTile] = boardArray[startTile];
		boardArray[startTile] = Piece.None;

		
		// Specialized move check
		if(Piece.isType(pieceToMove, Piece.Pawn)){
			// Set potential en passant target
			if(Math.abs(targetTile - startTile) === 16)enPassantTarget = targetTile - (targetTile - startTile)/2
			// Google en passant
			else if(targetTile === lastEnPassantTarget) {
				let holyHell = Piece.sameColor(pieceToMove,"W") ? 8: -8
				boardArray[targetTile + holyHell] = Piece.None
			}
		}else if(Piece.isType(pieceToMove, Piece.King)){
			// Check if move is kingside castling
			if(moveList.find(e => e.start === startTile && e.target === targetTile && e.note?.[friendlyColor] === "kingSide")){
				boardArray[startTile + 1] = boardArray[startTile + 3]; 
				boardArray[startTile + 3] = Piece.None;

				castlingRights[friendlyColor].kingSide = false
			}
			// Check if move is queenside castling
			else if(moveList.find(e => e.start === startTile && e.target === targetTile && e.note?.[friendlyColor] === "queenSide")){
				boardArray[startTile - 1] = boardArray[startTile - 4]; 
				boardArray[startTile - 4] = Piece.None;

				castlingRights[friendlyColor].queenSide = false
			}
			// Neither? then provoke all castling side
			else {
				castlingRights[friendlyColor] = {
					kingSide: false,
					queenSide: false,
				}
			}

		}else if(Piece.isType(pieceToMove, Piece.Rook)){
			if(Piece.getRank(startTile) === 7)castlingRights[friendlyColor].kingSide = false
			else if(Piece.getRank(startTile) === 0)castlingRights[friendlyColor].queenSide = false
		}

		
		castlingRights = castlingRights

		selectedTile = -1;
		
		futureMoveList = generateMoves(boardArray, turn)
		
		turn = turn == "B" ? "W" : "B"

		boardArray = boardArray;
	}

	$: futureMoveList, console.log("futureMovelist", futureMoveList)

	const generateCastlingMove = (tileIndex: number, piece: number, currentBoardArray: number[]):Move[] => {
  const friendlyColor = piece < 16 ? "W" : "B";

  const tempMoveList:Move[] = [];

	let castlingSide:["queenSide"|"kingSide", number, number][] = [["kingSide", 1, 3],["queenSide", -1, 4]]

  // Combine kingside and queenside checks for efficiency
  for (const [side, direction, rookOffset] of castlingSide) {
    if (castlingRights[friendlyColor][side]) {
			let isValid = true;

      for (let i = 0; i < rookOffset + 1 && isValid; i++) {
	
        const offset = i * direction;

	
        // Check for targeted squares
        if (i < rookOffset) {
          isValid = isValid && !futureMoveList.some((e) => e.target === tileIndex + offset);
        }
	
        // Check for empty squares and correct rook
        if (i > 0 && i < rookOffset) {
          isValid = isValid && currentBoardArray[tileIndex + offset] === Piece.None;
        } else if (i === rookOffset) {
          isValid = isValid &&
            Piece.isType(currentBoardArray[tileIndex + offset], Piece.Rook) &&
            Piece.sameColor(currentBoardArray[tileIndex + offset], friendlyColor);
        }
      }

      if (isValid) {
				tempMoveList.push({
					start: tileIndex,
		
          target: tileIndex + 2 * direction,
          note: { [friendlyColor]: side },
        });
      }
    }
  }

  return tempMoveList;
};


	const generatePawnMove = (tileIndex:number, piece:number, currentBoardArray: number[]):Move[] => {
		let friendlyColor:Color = piece < 16? "W":"B"

		let tempMoveList:Move[] = []
		
		let isOnStartingLine = Piece.sameColor(piece, "W")? Piece.getFile(tileIndex) === 6 : Piece.getFile(tileIndex) === 1

		let limit = isOnStartingLine? 2:1

		let pieceTarget = Piece.sameColor(piece, "W")? [4,0,5]:[7,2,6]

		// direction top left, top, top right for white
		// direction bottom left, bottom , bottom right for black
		for(let i = 0; i < 3; i++){

			let maxStep = i === 1 ? limit: 1
			
			for(let step = 1;step <= maxStep;step++){

				// break out of the loop if the edge is in the way
				if(numberOfTilesToEdge[tileIndex][direction[pieceTarget[i]]] === 0)break;


				let targetTile = tileIndex + (direction[pieceTarget[i]] * step)
				let targetPiece = currentBoardArray[targetTile]
				
				if(enPassantTarget !== targetTile){
					// Break out of the loop if diagonal space isnt opponent piece or the space is empty
					if((targetPiece === Piece.None || Piece.sameColor(targetPiece,friendlyColor)) && i !== 1)break;
	
					// if target piece isnt empty, break out of the loop of forward is blocked, or diagonal is occupied by friendly
					if(targetPiece !== Piece.None && (i === 1 || Piece.sameColor(targetPiece,friendlyColor)))break
				}

				tempMoveList.push({start:tileIndex, target: targetTile, note: enPassantTarget === targetTile? "enPassant":undefined})
			}
		}

		return tempMoveList
	}

	const generateKnightMove = (tileIndex: number, currentBoardArray: number[]):Move[] => {
		const knightMoveOffsets = [
			-17, -15, -6, 10, 17, 15, 6, -10
		];

		let tempMoveList: Move[] = []

		for (let i = 0; i < knightMoveOffsets.length; i++) {
			const targetTile = tileIndex + knightMoveOffsets[i];

			// Ensure the target tile is within bounds
			if (numberOfTilesToEdge[tileIndex][Math.floor(i/2)] >= 2) {
				const targetPiece = currentBoardArray[targetTile];

				// Knight can jump over pieces, so only check for friendly pieces
				if (!Piece.sameColor(targetPiece, turn)) {
					tempMoveList.push({ start: tileIndex, target: targetTile });
				}
			}
		}

		return tempMoveList
	};


	const generateSlidingMove = (tileIndex: number, piece:number, currentBoardArray: number[]):Move[] => {

		let tempMoveList: Move[] = []

		let friendlyColor:Color = piece < 16? "W":"B"
		let opponentColor:Color = piece < 16? "B":"W"

		let startDirectionIndex = Piece.isType(piece, Piece.Bishop)? 4 : 0
		let endDirectionIndex = Piece.isType(piece, Piece.Rook)? 4 : 8

		
		for(let directionIndex = startDirectionIndex;directionIndex < endDirectionIndex;directionIndex++){
			for(let j = 0;j < numberOfTilesToEdge[tileIndex][directionIndex];j++){

				// if its a king
				if(Piece.isType(piece, Piece.King) && j >= 1)break;

				let targetTile = tileIndex + direction[directionIndex] * (j + 1)

				let targetPiece = currentBoardArray[targetTile]

				// Same color piece
				if(targetPiece !== Piece.None && Piece.sameColor(targetPiece, friendlyColor)){
					break;
				}
				
				tempMoveList.push({start:tileIndex, target: targetTile})
				
				// Different color piece
				if(targetPiece !== Piece.None && Piece.sameColor(targetPiece, opponentColor)){
					break;
				}
			}
		}

		return tempMoveList
		
	}


	function handleDragDrop (e: DragEvent)  {
		e.preventDefault();
		console.log(e)
	}



</script>