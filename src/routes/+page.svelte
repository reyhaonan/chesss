
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








<script>
	import Board from "$components/Board.svelte";
	import Pawn from "$components/Pawn.svelte";
	import { convertFENToBoardArray, numberOfTilesToEdge } from "$lib/method";
	import { startingFEN } from "$lib/misc";

	let boardArray = convertFENToBoardArray(startingFEN)

	const limit = numberOfTilesToEdge()

	console.log(limit)

</script>