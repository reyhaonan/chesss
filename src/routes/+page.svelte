
<Board>
	<div class="absolute inset-0 grid grid-cols-8 grid-rows-8" id="board">
		{#each boardArray as pawn, i}
			<Tile pieceNumber={pawn} 
				highlightLastMove={lastMove.some(e => e === i)}
				highlightForMoveSuggestion={!!moveList.find(move => move.start === selectedTile && move.target === i)}
				highlightSelectedTile={selectedTile === i}
				on:click={
					() => {
						if(!!moveList.find(move => move.start === selectedTile && move.target === i))move(selectedTile, i)
						else if(!Piece.isType(pawn, Piece.None))selectedTile = i
						else selectedTile = -1
					}
				}
				on:drop={() => {
					if(!!moveList.find(move => move.start === selectedTile && move.target === i))move(selectedTile, i)
				}}
				on:dragend={() => selectedTile = -1}
				on:dragstart={() => selectedTile = i}

				turn={turn}

				debugIndex={i}
			/>
		{/each}

	</div>

	<!-- {#if } -->
	<div class="absolute top-0 left-0 bg-slate-800/60 inset-0 z-30" class:hidden={!piecePickerIsOpen} slot="picker">
		<div  class="piecePicker bg-slate-300 flex flex-col items-center justify-between absolute w-20 h-80" style="top:{topOffset}px;left:{leftOffset}px">
			<!-- svelte-ignore a11y-click-events-have-key-events -->

			<button on:click={() => pickPiece(Piece.Queen + Piece[turn])}>
				<img src={`/pawn_default/${Piece.Queen + Piece[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>

			<button on:click={() => pickPiece(Piece.Knight + Piece[turn])}>
				<img src={`/pawn_default/${Piece.Knight + Piece[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>

			<button on:click={() => pickPiece(Piece.Rook + Piece[turn])}>
				<img src={`/pawn_default/${Piece.Rook + Piece[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>

			<button on:click={() => pickPiece(Piece.Bishop + Piece[turn])}>
				<img src={`/pawn_default/${Piece.Bishop + Piece[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>
		</div>
	</div>

	<div class="absolute top-full">
		{JSON.stringify(castlingRights)}	</div>
	<!-- {/if} -->
</Board>


<svelte:window on:beforeunload={() => reject()}/>

<script lang="ts">
	import Board from "$components/Board.svelte";
	import Tile from "$components/Tile.svelte";
	import { convertFENToBoardArray, numberOfTilesToEdge, Piece } from "$lib/method";
	import { direction, startingFEN, type Move, type Color, type CastlingRightsType } from "$lib/misc";

	// let boardArray = convertFENToBoardArray("rnb1k1nr/ppPp1ppp/1Np1p3/8/8/2P1B3/PPP1bP1P/RNBQK2R w KQkq - 0 6")
	let boardArray = convertFENToBoardArray(startingFEN)

	let turn:Color = "White";

	let moveList:Move[] = []

	
	let futureMoveList: Move[] = []


	let selectedTile:number = -1;

	let castlingRights: CastlingRightsType = {
		White:{
			queenSide: true,
			kingSide: true
		},
		Black:{
			queenSide: true,
			kingSide: true
		},
	}

	let enPassantTarget:number|null = null

	let piecePickerIsOpen = false;
	let topOffset = 0;
	let leftOffset = 0;

	let lastMove:number[] = []

	
	$: boardArray, futureMoveList = generateMoves([...boardArray], turn === "White"?"Black":"White", Object.assign({}, castlingRights), 0), moveList =  generateMoves([...boardArray], turn, {...castlingRights}, 1)

	$: moveList, console.log("moveList", moveList)
	$: if(moveList.length === 0)alert(turn + " is lost");



	const generateMoves = (currentBoardArray: number[], currentTurn: Color, currentCastlingRights: CastlingRightsType, futureCheck:number):Move[] => {

		let tempMoveList:Move[] = []

		let nextTurn:Color = currentTurn === "White" ? "Black" : "White"
		
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

		// Filter out movement that would result in king getting targetted
		if(futureCheck > 0)tempMoveList = tempMoveList.filter((move) => {
			let {newBoardArray, newCastlingRights} = executeMove([...currentBoardArray], move.start, move.target, currentCastlingRights)
			// return true

			return !generateMoves([...newBoardArray], nextTurn, newCastlingRights, --futureCheck).some(move => Piece.isType(newBoardArray[move.target], Piece.King))
		})
		

		return tempMoveList
	}


	const pickPiece = (pieceNumber: number) => {
		resolve(pieceNumber);
		piecePickerIsOpen = false
	}

	
	let resolve: (pieceNumber: number) => void;
	let reject: () => void;

	const openPickerOverlay = (tileNumber:number) => {
		return new Promise<number>((res, rej) => {
			piecePickerIsOpen = true
			topOffset = Piece.getFile(tileNumber) * 80
			leftOffset = Piece.getRank(tileNumber) * 80;


			resolve = res
			reject = rej


		})
	}
	

	const move = async (startTile:number, targetTile:number) => {
		
		let friendlyColor: Color = boardArray[selectedTile] < 16? "White":"Black"
		/* -------------------------------------------------------------------------- */
		/*                                  Promotion                                 */
		/* -------------------------------------------------------------------------- */
		let endOfLine = friendlyColor === "White"? 0 : 7
		
		let pickedPiece:number | undefined;

		if(Piece.getFile(targetTile) === endOfLine && Piece.isType(boardArray[selectedTile], Piece.Pawn)){
			try{
				pickedPiece = await openPickerOverlay(targetTile)
			}catch{
				// Cancel out movement entirely
				return 
			}
		}

		let {newBoardArray, enPassantPotential, newCastlingRights} = executeMove(boardArray, startTile, targetTile, {...castlingRights}, pickedPiece )

		lastMove = [startTile, targetTile]

		enPassantTarget = enPassantPotential ?? null;

		selectedTile = -1;

		turn = turn == "Black" ? "White" : "Black"

		castlingRights = newCastlingRights;

		boardArray = newBoardArray;
	}


	type BoardInfo = {
		newBoardArray:number[],
		enPassantPotential:number|null
		newCastlingRights:CastlingRightsType
	}

	const executeMove = (currentBoardArray:number[], startTile:number, targetTile:number, currentCastlingRights:CastlingRightsType, pickedPiece?:number):BoardInfo => {

		let pieceToMove = currentBoardArray[startTile]

		let friendlyColor: Color = pieceToMove < 16? "White":"Black"

		let enPassantPotential = null

		
		// Specialized move check
		if(Piece.isType(pieceToMove, Piece.Pawn)){

			if(pickedPiece)pieceToMove = pickedPiece

			/* -------------------------------------------------------------------------- */
			/*                                 En Passant                                 */
			/* -------------------------------------------------------------------------- */
			// Set potential en passant target
			if(Math.abs(targetTile - startTile) === 16)enPassantPotential = targetTile - (targetTile - startTile)/2
			// Google en passant
			else if(targetTile === enPassantTarget) {
				let holyHell = Piece.sameColor(pieceToMove,"White") ? 8: -8
				currentBoardArray[targetTile + holyHell] = Piece.None
			}
		}
		/* -------------------------------------------------------------------------- */
		/*                                  Castling                                  */
		/* -------------------------------------------------------------------------- */
		else if(Piece.isType(pieceToMove, Piece.King)){
			// Check if move is kingside castling
			if(moveList.find(e => e.start === startTile && e.target === targetTile && e.note?.[friendlyColor] === "kingSide")){
				currentBoardArray[startTile + 1] = currentBoardArray[startTile + 3]; 
				currentBoardArray[startTile + 3] = Piece.None;

				currentCastlingRights[friendlyColor].kingSide = false
			}
			// Check if move is queenside castling
			else if(moveList.find(e => e.start === startTile && e.target === targetTile && e.note?.[friendlyColor] === "queenSide")){
				currentBoardArray[startTile - 1] = currentBoardArray[startTile - 4]; 
				currentBoardArray[startTile - 4] = Piece.None;

				currentCastlingRights[friendlyColor].queenSide = false
			}
			// Neither? then provoke all castling side
			else {
				currentCastlingRights[friendlyColor] = {
					queenSide: false,
					kingSide: false,
				}
			}

		}
		/* -------------------------------------------------------------------------- */
		/*                             Castling Invalidate                            */
		/* -------------------------------------------------------------------------- */
		else if(Piece.isType(pieceToMove, Piece.Rook)){
			console.log("WHAT",currentCastlingRights)
			if(Piece.getRank(startTile) === 7)currentCastlingRights[friendlyColor].kingSide = false
			else if(Piece.getRank(startTile) === 0)currentCastlingRights[friendlyColor].queenSide = false
		}



		// Execute actual Moves
		currentBoardArray[targetTile] = pieceToMove;
		currentBoardArray[startTile] = Piece.None;

		return {newBoardArray: currentBoardArray, enPassantPotential, newCastlingRights: currentCastlingRights}
	}


	$: futureMoveList, console.log("futureMovelist", futureMoveList)

	const generateCastlingMove = (tileIndex: number, piece: number, currentBoardArray: number[]):Move[] => {
		const friendlyColor = piece < 16 ? "White" : "Black";

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
		let friendlyColor:Color = piece < 16? "White":"Black"

		let tempMoveList:Move[] = []
		
		let isOnStartingLine = Piece.sameColor(piece, "White")? Piece.getFile(tileIndex) === 6 : Piece.getFile(tileIndex) === 1

		let limit = isOnStartingLine? 2:1

		let pieceTarget = Piece.sameColor(piece, "White")? [4,0,5]:[7,2,6]

		// direction top left, top, top right for white
		// direction bottom left, bottom , bottom right for black
		for(let i = 0; i < 3; i++){

			let maxStep = i === 1 ? limit: 1

			// continue to the next loop if the edge is in the way
			if(numberOfTilesToEdge[tileIndex][pieceTarget[i]] === 0)continue;
			
			for(let step = 1;step <= maxStep;step++){
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

		let friendlyColor:Color = piece < 16? "White":"Black"
		let opponentColor:Color = piece < 16? "Black":"White"

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



</script>