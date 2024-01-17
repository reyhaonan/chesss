
<Board>
	<div class="absolute inset-0 grid grid-cols-8 grid-rows-8" id="board">
		{#each [...Array(64)] as el, i}
			<Tile 
				pieceNumber={boardArray.get(i)} 
				highlightLastMove={lastMove.some(e => e === i)}
				highlightForMoveSuggestion={!!moveList.find(move => move.start === selectedTile && move.target === i)}
				highlightSelectedTile={selectedTile === i}
				on:click={
					() => {
						let moveToUse = moveList.find(move => move.start === selectedTile && move.target === i)
						if(!!moveToUse)move(moveToUse)
						else if(!Piece.isType(boardArray.get(i), PieceType.None))selectedTile = i
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

			<button on:click={() => pickPiece(PieceType.Queen + PieceColor[turn])}>
				<img src={`/pawn_default/${PieceType.Queen + PieceColor[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>

			<button on:click={() => pickPiece(PieceType.Knight + PieceColor[turn])}>
				<img src={`/pawn_default/${PieceType.Knight + PieceColor[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>

			<button on:click={() => pickPiece(PieceType.Rook + PieceColor[turn])}>
				<img src={`/pawn_default/${PieceType.Rook + PieceColor[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>

			<button on:click={() => pickPiece(PieceType.Bishop + PieceColor[turn])}>
				<img src={`/pawn_default/${PieceType.Bishop + PieceColor[turn]}.svg`}  class="select-none w-16 z-20 cursor-pointer" alt=""/>
			</button>
		</div>
	</div>

	<!-- <div class="absolute top-full text-neutral-50">
		<div class="font-bold text-2xl">Game param</div>
		{#each boardArrayHistory as aa}
			<li>
				{JSON.stringify([...aa, [...aa[0].entries()].sort()])}
			</li>
			{/each}
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
			Full Move: {fullMoveClock}
		</li>
	</div> -->
</Board>

<svelte:window on:beforeunload={() => reject()}/>

<script lang="ts">
	import Board from "$components/Board.svelte";
	import Tile from "$components/Tile.svelte";
	import { convertFENToBoardArray, executeMove, generateMoves, isThreefoldRepetition } from "$lib/Engine";
	import { Piece } from "$lib/Piece";
	import { startingFEN, type Move, type Color, type BoardHistory, PieceColor, PieceType, type CastlingRightsType } from "$lib/misc";
	import boardInfo from "$stores/BoardInfo";
	import boardLookup from "$stores/BoardLookup";
	import moveHistory from "$stores/MoveHistory";

	$boardInfo = convertFENToBoardArray(startingFEN)
	// $boardInfo = convertFENToBoardArray("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1")

	$:[
		boardArray, 
		turn, 
		castlingRights, 
		enPassantTarget, 
		halfMoveClock, 
		fullMoveClock 
	] = $boardInfo

	$: console.log("BO", $boardInfo[0], boardArray.get(1))

	let moveList:Move[] = []
	
	let threatMoveList: Move[] = []


	let selectedTile:number = -1;

	let piecePickerIsOpen = false;
	let topOffset = 0;
	let leftOffset = 0;

	let lastMove:number[] = []

	// i store only 10 of these for threefold checks
	let boardArrayHistory: BoardHistory[] = []


	
	$: boardArray, threatMoveList = generateMoves(boardArray, turn === "White"?"Black":"White",  castlingRights, enPassantTarget, halfMoveClock, fullMoveClock, [])
	$: boardArray, threeFoldCheck()
	$: threatMoveList, moveList =  generateMoves(boardArray, turn, castlingRights, enPassantTarget, halfMoveClock, fullMoveClock, threatMoveList)
	$: if($moveHistory.length > 0)$moveHistory[$moveHistory.length - 1].threatListToOpponent = threatMoveList
	
	
	$: if(halfMoveClock >= 100)alert("draw")
	$: if(moveList.length === 0){
		if(threatMoveList.some(move => Piece.isType(boardArray.get(move.target)!, PieceType.King))){
			alert(turn + " is lost")
			$moveHistory[$moveHistory.length - 1].isCheckMate = true
		}else{
			alert("draw")
		}
	}

	const threeFoldCheck = () => {
		console.log("AY")
		if(boardArrayHistory.length >= 10)boardArrayHistory.shift()

		boardArrayHistory = [...boardArrayHistory, [boardArray, castlingRights, enPassantTarget]]

		if(isThreefoldRepetition(boardArrayHistory))alert("Threefold draw")
	}

	// $: turn, boardArray, moveList, moveRandomly()



	// const moveRandomly = () => {
	// 	let selectedMove = moveList[Math.floor(Math.random() * moveList.length)]

	// 	console.log("executed", selectedMove.start, selectedMove.target)
	// 	move(selectedMove)
	// }

	const pickPiece = (pieceNumber: number) => {
		resolve(pieceNumber);
		piecePickerIsOpen = false
	}

	let resolve: (pieceNumber: number) => void;
	let reject: () => void;

	const openPickerOverlay = (tileNumber:number) => {
		return new Promise<number>((res, rej) => {
			piecePickerIsOpen = true
			topOffset = Piece.getRank(tileNumber) * 80
			leftOffset = Piece.getFile(tileNumber) * 80;

			resolve = res
			reject = rej
		})
	}
	
	// Move fn
	const move = async (move: Move) => {
		
		let {start: startTile, target: targetTile, note} = move

		console.log("MOVED ONCE")
		
		let friendlyColor: Color = boardArray.get(selectedTile)! < 16? "White":"Black"
		/* -------------------------------------------------------------------------- */
		/*                                  Promotion                                 */
		/* -------------------------------------------------------------------------- */
		let endOfLine = friendlyColor === "White"? 0 : 7
		
		let pickedPiece:number | undefined;

		if(Piece.getRank(targetTile) === endOfLine && Piece.isType(boardArray.get(startTile)!, PieceType.Pawn)){
			try{
				move.note = "promote"
				pickedPiece = await openPickerOverlay(targetTile)
			}catch{
				// Cancel out movement entirely
				return 
			}
		}

		let {newBoardArray, newCastlingRights, newEnPassantTarget, newTurn, newHalfMoveClock, newFullMoveClock} = executeMove(boardArray, move, turn,castlingRights, enPassantTarget, halfMoveClock, fullMoveClock, pickedPiece  )

		console.log("surprise ", newCastlingRights)

		lastMove = [startTile, targetTile]

		$moveHistory = [...$moveHistory, {
				newBoardArray, 
				newTurn, 
				newCastlingRights, 
				newEnPassantTarget, 
				newHalfMoveClock, 
				newFullMoveClock,
				lastMove,
				turn,
				startTile: move.start, 
				targetTile: move.target,
				note:move.note,
				pieceToMove: boardArray.get(startTile)!,
				pieceTarget: boardArray.get(targetTile)!,
				moveList: [...moveList],
				// Leaving this to sideeffect
				threatListToOpponent: [],
				isCheckMate: false
			}
		]

		$boardLookup = {current:$boardLookup.current + 1, lookup: $boardLookup.lookup + 1}

		enPassantTarget = newEnPassantTarget;

		selectedTile = -1;

		halfMoveClock = newHalfMoveClock

		fullMoveClock = newFullMoveClock

		turn = newTurn

		castlingRights = newCastlingRights;

		boardArray = new Map(newBoardArray);
	}


	$: threatMoveList, console.log("threatMoveList", threatMoveList)
	$: moveList, console.log("moveList", moveList)


</script>