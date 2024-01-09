
<div class="grid grid-cols-12">
	<div class="sidebar col-span-2">a</div>
	<main class="content col-span-8">

		<div class="w-full flex items-center justify-center my-8">
			<Board>
				{#each boardArray as pawn, i}
					<div class="flex items-center justify-center relative">
						<Pawn pieceNumber={pawn}/>

						<!-- debug -->
						<div class="absolute left-0 bottom-0 text-xs">
							{i}
						</div>
					</div>
				{/each}
			</Board>
		</div>
	</main>
	<div class="sidebar col-span-2">b</div>
</div>








<script lang="ts">
	import Board from "$components/Board.svelte";
	import Pawn from "$components/Pawn.svelte";
	import { convertFENToBoardArray, numberOfTilesToEdge, Piece } from "$lib/method";
	import { direction, startingFEN, type Move, type Color } from "$lib/misc";

	let boardArray = convertFENToBoardArray("rnbqkbnr/pppppppp/8/8/8/8/8/RNBQKBNR")

	let turn:Color = "W";

	let moveList:Move[] = []

	const generateMoves = () => {
		
		for(let i = 0;i < 64;i++){
			let piece = boardArray[i];
			
			// this piece turn
			if(Piece.sameColor(piece, turn)){
				
				if(!(Piece.isType(piece, Piece.Pawn)||Piece.isType(piece, Piece.Knight))){
					generateSlidingMove(i, piece)
				}
			}
		}
	}

	$: boardArray, turn, generateMoves()

	$: moveList, console.log("moveList",moveList)


	const generateSlidingMove = (tileIndex: number, piece:number) => {

		let friendlyColor:Color = piece < 16? "W":"B"
		let opponentColor:Color = piece < 16? "B":"W"

		let startDirectionIndex = Piece.isType(piece, Piece.Bishop)? 4 : 0
		let endDirectionIndex = Piece.isType(piece, Piece.Rook)? 4 : 8

		
		for(let directionIndex = startDirectionIndex;directionIndex < endDirectionIndex;directionIndex++){
			for(let j = 0;j < numberOfTilesToEdge[tileIndex][directionIndex];j++){
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

	


</script>