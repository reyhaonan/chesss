<div class="col-span-3 bg-slate-800 text-neutral-50 px-8 py-16">
  <div class="moveHistory grid grid-cols-2">
    {#each $moveHistory as move}
      <div class="">{convertMoveToAlgebraicNotation(move)}</div>
    {/each}
  </div>
</div>

<script lang="ts">
	import { convertNumberToAlgebraicNotation } from "$lib/Engine";
  import moveHistory, { type moveHistoryType } from "$stores/MoveHistory";


  const convertMoveToAlgebraicNotation = (move: moveHistoryType) => {

    move.pieceToMove

    return "A"
  }

</script>