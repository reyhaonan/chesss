
<Board>
	<div class="absolute inset-0 grid grid-cols-8 grid-rows-8" id="board">
		{#each boardArray as pawn, i}
			<Tile pieceNumber={pawn} 
				highlightLastMove={lastMove.some(e => e === i)}
				highlightForMoveSuggestion={!!moveList.find(move => move.start === selectedTile && move.target === i)}
				highlightSelectedTile={selectedTile === i}
				on:click={
					() => {
						let moveToUse = moveList.find(move => move.start === selectedTile && move.target === i)
						if(!!moveToUse)move(moveToUse)
						else if(!Piece.isType(pawn, Piece.None))selectedTile = i
						else selectedTile = -1
					}
				}
				on:drop={() => {
					let moveToUse = moveList.find(move => move.start === selectedTile && move.target === i)
					if(!!moveToUse)move(moveToUse)
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

	<div class="absolute top-full text-neutral-50">
		<div class="font-bold text-2xl">Game param</div>
		<li>
			Castling rights(KQkq): {JSON.stringify(castlingRights)}
		</li>
		<li>
			En Passant Target: {enPassantTarget}
		</li>
		<li>
			Half Move: {halfMoveClock}
		</li>
		<li>
			Last Move: {JSON.stringify(lastMove)}
		</li>
		<li>
			Board History: {JSON.stringify(boardArrayHistory)}
		</li>
		<button on:click={moveRandomly}>MOVE {turn}</button></div>
	<!-- {/if} -->
</Board>


<!-- TODO: 50 move rule, 3 fold repetition -->

<svelte:window on:beforeunload={() => reject()}/>

<script lang="ts">
	import Board from "$components/Board.svelte";
	import Tile from "$components/Tile.svelte";
	import { convertFENToBoardArray, executeMove, generateCastlingMove, generateKnightMove, generatePawnMove, generateSlidingMove, numberOfTilesToEdge, Piece } from "$lib/method";
	import { direction, startingFEN, type Move, type Color, type CastlingRightsType } from "$lib/misc";

	// let boardArray = convertFENToBoardArray("2k5/7Q/8/8/8/8/1Q2Q3/5K2 w - - 0 1")
	let boardArray = convertFENToBoardArray(startingFEN)

	let turn:Color = "White";

	let moveList:Move[] = []

	
	let threatMoveList: Move[] = []


	let selectedTile:number = -1;

	let castlingRights: CastlingRightsType = [true, true, true, true]

	let enPassantTarget:number|null = null

	let piecePickerIsOpen = false;
	let topOffset = 0;
	let leftOffset = 0;

	let lastMove:number[] = []

	let halfMoveClock = 0;

	// i store only 6 of these for threefold checks
	let boardArrayHistory: number[][] = []
	

	
	$: boardArray, threatMoveList = generateMoves([...boardArray], turn === "White"?"Black":"White", [],  [...castlingRights], enPassantTarget, halfMoveClock, 1)
	$: threatMoveList, moveList =  generateMoves([...boardArray], turn, threatMoveList, [...castlingRights], enPassantTarget, halfMoveClock, 1)

	$: moveList, console.log("moveList", moveList)
	
	
	$: if(halfMoveClock >= 100)alert("draw")
	$: if(moveList.length === 0){
		if(threatMoveList.some(move => Piece.isType(boardArray[move.target], Piece.King))){
			alert(turn + " is lost")
		}else{
			alert("draw")
		}
	}

	// $: turn, boardArray, moveList, moveRandomly()



	const moveRandomly = () => {
		let selectedMove = moveList[Math.floor(Math.random() * moveList.length)]

		console.log("executed", selectedMove.start, selectedMove.target)
		move(selectedMove)
	}


	const generateMoves = (
			currentBoardArray: number[], 
			currentTurn: Color, 
			currentFutureMoveList: Move[], 
			currentCastlingRights: CastlingRightsType, 
			currentEnPassantTarget:number|null, 
			currentHalfMoveClock:number,
			futureCheck:number
		) : Move[] => {

		let tempMoveList:Move[] = []

		let nextTurn:Color = currentTurn === "White" ? "Black" : "White"
		
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
			
			let {newBoardArray, newEnPassantTarget, newCastlingRights, newHalfMoveClock} = executeMove([...currentBoardArray], move, {...currentCastlingRights}, currentEnPassantTarget, currentHalfMoveClock)
			
			// Filter out movement that would result in king getting targetted
			return move.target >= 0 && move.target < 64 && !generateMoves([...newBoardArray], nextTurn, currentFutureMoveList, {...newCastlingRights}, newEnPassantTarget, newHalfMoveClock, --futureCheck).some(move => Piece.isType(newBoardArray[move.target], Piece.King) && Piece.sameColor(newBoardArray[move.target], currentTurn))
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
	

	// Move fn
	const move = async (move: Move) => {

		
		let {start: startTile, target: targetTile, note} = move

		console.log("MOVED ONCE")
		
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

		let {newBoardArray, newCastlingRights, newEnPassantTarget, newHalfMoveClock} = executeMove([...boardArray], move, [...castlingRights], enPassantTarget, halfMoveClock, pickedPiece  )

		console.log("surprise ", newCastlingRights)

		lastMove = [startTile, targetTile]

		enPassantTarget = newEnPassantTarget;

		selectedTile = -1;

		halfMoveClock = newHalfMoveClock

		turn = turn == "Black" ? "White" : "Black"

		castlingRights = newCastlingRights;

		if(boardArrayHistory.length >= 6)boardArrayHistory.shift()
		boardArrayHistory.push([...boardArray])

		boardArrayHistory = boardArrayHistory

		boardArray = newBoardArray;
	}



	$: threatMoveList, console.log("threatMoveList", threatMoveList)


</script>