<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="w-full flex items-center justify-center relative"
  class:cursor-pointer={highlightForMoveSuggestion}
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
    {#if !!pieceNumber}
      <div class="w-full border-red-900/30 border-8 rounded-full aspect-square absolute-center"></div>
    {:else}
      <div class="w-6 bg-red-900/30 rounded-full aspect-square absolute-center"></div>
    {/if}
  {:else if highlightLastMove}
    <div class="absolute inset-0 bg-amber-500/40">
      
    </div>
  {/if}
  {#if highlightSelectedTile}
    <div class="absolute inset-0 bg-red-900/30"></div>
  {/if}

  <div class="absolute text-left text-red-500 z-50 right-0 top-0 text-xs">{convertAlgebraicNotationToNumber(convertNumberToAlgebraicNotation(debugIndex))}</div>

  <!-- <div class="absolute flex flex-wrap inset-0 justify-around items-stretch text-xs bg-black/20 z-30">
    {#each numberOfTilesToEdge[debugIndex] as e, i}
      {#if i === 4}
      <div class="w-1/3 text-center text-red-500">{debugIndex}</div>
      {/if}
      <div class="w-1/3 text-center">{e}</div>
    {/each}
  </div> -->
</div>

<script lang="ts">
	import { Piece, convertAlgebraicNotationToNumber, convertNumberToAlgebraicNotation, numberOfTilesToEdge } from "$lib/Engine";
	import type { Color } from "$lib/misc";

  // console.log("te",convertNumberToAlgebraicNotation(1))

  export let pieceNumber:number = 0;
  export let highlightForMoveSuggestion = false
  export let highlightSelectedTile = false
  export let highlightLastMove = false

  export let debugIndex:number

  export let turn:Color;

  $: correctTurn = Piece.sameColor(pieceNumber, turn)

</script>