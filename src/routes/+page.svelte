
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
									if(!!moveList.find(move => move.start === selectedTile && move.target === i))executeMove(selectedTile,i)
									else selectedTile = i
								}
							}
							on:drop={() => {
								if(!!moveList.find(move => move.start === selectedTile && move.target === i))executeMove(selectedTile,i)
							}}
							on:dragend={() => selectedTile = -1}
							on:dragstart={() => selectedTile = i}

							turn={turn}

							debugIndex={Piece.getFile(i)}
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

	let boardArray = convertFENToBoardArray("rnbqkbnr/pppppppp/8/8/pppppppp/8/pppppppp/RNBQKBNR")
	// let boardArray = convertFENToBoardArray(startingFEN)

	let turn:Color = "W";

	let moveList:Move[] = []

	let selectedTile:number = -1;

	const generateMoves = () => {

		moveList = []
		
		for(let i = 0;i < 64;i++){
			let piece = boardArray[i];
			
			// this piece turn
			if(Piece.sameColor(piece, turn)){
				
				if(Piece.isType(piece, Piece.Pawn)){
					generatePawnMove(i, piece) 
				}
				else if(Piece.isType(piece, Piece.Knight)){
					// generateKnightMove() 
				}
				else{
					generateSlidingMove(i, piece)
				}
			}
		}
	}

	$: boardArray, turn, generateMoves()

	$: moveList, console.log("moveList",moveList)

	const executeMove = (startTile:number, targetTile:number) => {
		boardArray[targetTile] = boardArray[startTile];
		boardArray[startTile] = Piece.None;
		boardArray = boardArray;
		selectedTile = -1;
		turn = turn == "B"?"W":"B"
	}

	const generatePawnMove = (tileIndex:number, piece:number)=>{
		let friendlyColor:Color = piece < 16? "W":"B"
		let opponentColor:Color = piece < 16? "B":"W"



		let isOnStartingLine = Piece.sameColor(piece, "W")? Piece.getFile(tileIndex) === 6 : Piece.getFile(tileIndex) === 1

		let limit = isOnStartingLine? 2:1

		let pieceTarget = Piece.sameColor(piece, "W")? [4,0,5]:[7,2,6]

		// direction top left, top, top right for white
		// direction bottom left, bottom , bottom right for black
		for(let i = 0; i < 3; i++){

			let limitForDirection = i === 1 ? limit: 1
			
			for(let j = 1;j <= limitForDirection;j++){

				// break out of the loop if the edge is in the way
				if(numberOfTilesToEdge[tileIndex][direction[pieceTarget[i]]] === 0)break;


				let targetTile = tileIndex + (direction[pieceTarget[i]] * j)
				let targetPiece = boardArray[targetTile]
				
				// Break out of the loop if diagonal isnt opponent piece or empty
				if((targetPiece === Piece.None || Piece.sameColor(targetPiece,friendlyColor)) && i !== 1)break;

				// if target piece isnt empty, break out of the loop of forward is blocked, or diagonal is occupied by friendly
				if(targetPiece !== Piece.None && (i === 1 || Piece.sameColor(targetPiece,friendlyColor)))break

				moveList.push({start:tileIndex, target: targetTile})
				moveList = moveList
			}
		}
	}

	const generateSlidingMove = (tileIndex: number, piece:number) => {

		let friendlyColor:Color = piece < 16? "W":"B"
		let opponentColor:Color = piece < 16? "B":"W"

		let startDirectionIndex = Piece.isType(piece, Piece.Bishop)? 4 : 0
		let endDirectionIndex = Piece.isType(piece, Piece.Rook)? 4 : 8

		
		for(let directionIndex = startDirectionIndex;directionIndex < endDirectionIndex;directionIndex++){
			for(let j = 0;j < numberOfTilesToEdge[tileIndex][directionIndex];j++){

				// if its a king
				if(Piece.isType(piece, Piece.King) && j >= 1)break;

				let targetTile = tileIndex + direction[directionIndex] * (j + 1)

				let targetPiece = boardArray[targetTile]

				// Same color piece
				if(targetPiece !== Piece.None && Piece.sameColor(targetPiece, friendlyColor)){
					break;
				}
				
				moveList.push({start:tileIndex, target: targetTile})
				moveList = moveList
				
				// Different color piece
				if(targetPiece !== Piece.None && Piece.sameColor(targetPiece, opponentColor)){
					break;
				}
			}
		}
		
	}


	function handleDragDrop (e: DragEvent)  {
		e.preventDefault();
		console.log(e)
	}



</script>