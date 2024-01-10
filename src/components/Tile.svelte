<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="w-full flex items-center justify-center relative"
  on:click
  on:drop
    on:dragover={(e) => {
    e.preventDefault()
  }}
>
  {#if !!pieceNumber}
    <img src={`/pawn_default/${pieceNumber}.svg`} 
    class="select-none w-16 z-20 cursor-pointer"
    alt="" draggable={correctTurn?true:false}
    on:dragstart
    on:dragend
    />
  {/if}

  {#if highlightForMoveSuggestion}
    <div class="absolute inset-0 bg-red-600/70 flex items-center justify-center">
      <div class="w-8 bg-red-900/10 rounded-full aspect-square"></div>
    </div>
  {/if}
  {#if highlightSelectedTile}
    <div class="absolute inset-0 bg-amber-500/50"></div>
  {/if}

  <div class="absolute right-0 bottom-0 text-xs">{debugIndex}</div>
</div>

<script lang="ts">
	import { Piece } from "$lib/method";
	import type { Color } from "$lib/misc";

  export let pieceNumber:number = 0;
  export let highlightForMoveSuggestion = false
  export let highlightSelectedTile = false

  export let debugIndex:number

  export let turn:Color;

  $: correctTurn = Piece.sameColor(pieceNumber, turn)

</script>