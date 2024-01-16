
<div class="text-neutral-50 text-6xl">

	{#each counter as count, i}
		<li>
			depth {i + 1}: {count}</li>
	{/each}

	<button on:click={performTest} class="p-4 bg-slate-50 rounded-md mt-8 text-slate-900">Perform Test with {DEPTH} depth</button>

</div>


<script lang="ts">
	import { convertFENToBoardArray, executeMove, generateMoves } from "$lib/Engine";
	import { type Color, type CastlingRightsType, type Move, startingFEN } from "$lib/misc";

	let counter = [0, 0, 0, 0]

  let [
		boardArray, 
		turn, 
		castlingRights, 
		enPassantTarget, 
		halfMoveClock, 
		fullMoveClock 
	] = convertFENToBoardArray(startingFEN)

	let DEPTH = 3
  
	let moveList:Move[] = []
	
	let threatMoveList: Move[] = []

  const performTest = () => {
    countTotalMove(DEPTH, 0, moveList, {
        currentBoardArray:boardArray,
        currentCastlingRights: castlingRights,
        currentEnPassantTarget: enPassantTarget,
        currentFullMoveClock: fullMoveClock,
        currentHalfMoveClock: halfMoveClock,
        currentTurn: turn,
      })
  }

  
	type boarrd = {
		currentBoardArray: Map<number, number>,
		currentTurn: Color,
		currentCastlingRights: CastlingRightsType,
		currentEnPassantTarget: number | null,
		currentHalfMoveClock: number,
		currentFullMoveClock: number,
	}
  
	const countTotalMove = (depth: number, id: number, currentMoveList: Move[], {currentBoardArray, currentTurn, currentCastlingRights, currentEnPassantTarget, currentHalfMoveClock, currentFullMoveClock}:boarrd) => {
		let nextId = id + 1
		let nextDepth = depth - 1
		for(const i of currentMoveList){
			// exe
			let {newBoardArray, newCastlingRights, newEnPassantTarget, newTurn, newHalfMoveClock, newFullMoveClock,} = executeMove(currentBoardArray, i, currentTurn, currentCastlingRights, currentEnPassantTarget, currentHalfMoveClock, currentFullMoveClock)
			// gen
			let newMov = generateMoves(newBoardArray, newTurn, newCastlingRights, newEnPassantTarget, newHalfMoveClock, newFullMoveClock, threatMoveList)
			// tambah
			counter[id] += newMov.length

			if(nextDepth == 0)continue;
			
			countTotalMove(nextDepth, nextId, newMov, {
				currentBoardArray:newBoardArray,
				currentCastlingRights: newCastlingRights,
				currentEnPassantTarget: newEnPassantTarget,
				currentFullMoveClock: newFullMoveClock,
				currentHalfMoveClock: newHalfMoveClock,
				currentTurn: newTurn,
			})
		}


		// console.log("executed", selectedMove.start, selectedMove.target)
	}

  
	
	$: boardArray, threatMoveList = generateMoves(boardArray, turn === "White"?"Black":"White",  castlingRights, enPassantTarget, halfMoveClock, fullMoveClock, [])
	$: threatMoveList, moveList =  generateMoves(boardArray, turn, castlingRights, enPassantTarget, halfMoveClock, fullMoveClock, threatMoveList)

  
	$: threatMoveList, console.log("threatMoveList", threatMoveList)
	$: moveList, console.log("moveList", moveList)


</script>