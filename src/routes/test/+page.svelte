
<div class="text-neutral-50 text-2xl">

	<li>
		depth 1: {moveList.length}, expected: 20
	</li>
	{#each counter as count, i}
		<li>
			depth {i + 2}: {count}, expected: {depthExpectation[i]}
		</li>
	{/each}

	<input type="number" min="0" max="8" bind:value={DEPTH} class="bg-transparent rounded-md border border=neutral-50 mt-32 p-4">
	<button disabled={typeof DEPTH !== "number" || DEPTH < 1 || DEPTH > 8} on:click={performTest} class="p-4 bg-slate-50 disabled:bg-slate-600 rounded-md mt-8 text-slate-900">Perform Test with {DEPTH ?? "Invalid"} depth</button>

</div>


<script lang="ts">
	import { convertFENToBoardArray, executeMove, generateMoves } from "$lib/Engine";
	import { type Color, type CastlingRightsType, type Move, startingFEN } from "$lib/misc";

	let DEPTH = 2

	const depthExpectation = [
		400, 
		8_092, 
		197_281, 
		4_865_609, 
		119_060_324,
		3_195_901_860,
		84_998_978_956,
	]

	let counter = [0, 0, 0, 0]

  let [
		boardArray, 
		turn, 
		castlingRights, 
		enPassantTarget, 
		halfMoveClock, 
		fullMoveClock 
	] = convertFENToBoardArray(startingFEN)

  
	let moveList:Move[] = []
	
	let threatMoveList: Move[] = []

  const performTest = () => {
		if(typeof DEPTH !== "number" || DEPTH < 1 || DEPTH > 8)return alert("INVALID");

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

			if(nextDepth == 1)continue;
			
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