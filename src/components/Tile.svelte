<script lang="ts">
	import { Piece } from '$lib/Piece';
	import type { Color } from '$lib/misc';
	import { fade } from 'svelte/transition';

	export let pieceNumber: number | undefined = 0;
	export let highlightForMoveSuggestion = false;
	export let highlightSelectedTile = false;
	export let highlightLastMove = false;
	export let highlightCheck = false;

	export let debugIndex: number;

	export let turn: Color;

	$: correctTurn = Piece.sameColor(pieceNumber, turn);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="absolute inset-0 flex items-center justify-center  group"
	class:cursor-pointer={highlightForMoveSuggestion}
	on:click
	on:drop
	on:dragover={(e) => {
		e.preventDefault();
	}}
>
	{#if !!pieceNumber}
		<img
			src={`/pawn_default/${pieceNumber}.svg`}
			class="select-none w-4/5 z-20 cursor-pointer"
			alt=""
			draggable={correctTurn ? true : false}
			on:dragstart
			on:dragend
		/>
	{/if}

	{#if highlightForMoveSuggestion}
		{#if !!pieceNumber}
			<div
				class="w-11/12 border-background/50 border-[6px] rounded-full transition-all duration-75 group-hover:bg-background/50 group-hover:border-transparent group-hover:w-full group-hover:rounded-none aspect-square absolute-center"
			></div>
		{:else}
			<div
				class="w-1/3 bg-background/50 transition-all duration-75 group-hover:w-full group-hover:rounded-none rounded-full aspect-square absolute-center"
			></div>
		{/if}
	{:else if highlightLastMove}
		<div class="absolute inset-0 bg-accent/60"></div>
	{/if}
	{#if highlightSelectedTile}
		<div class="absolute inset-0 bg-accent/40"></div>
	{:else if highlightCheck}
		<div class="absolute inset-0 bg-red-700 text-red-700"></div>
	{/if}

	<!-- <div class="absolute text-left text-red-500 z-50 right-0 top-0 text-xs">{debugIndex}</div> -->
	<!-- <div class="absolute text-left text-red-500 z-50 right-0 top-0 text-xs">file: {Piece.getFile(debugIndex)} rank:{Piece.getRank(debugIndex)}</div> -->
	<!-- <div class="absolute text-left text-red-500 z-50 right-0 top-0 text-xs">
    {convertAlgebraicNotationToNumber(convertNumberToAlgebraicNotation(debugIndex))}, {convertNumberToAlgebraicNotation(debugIndex)}
  </div> -->

	<!-- <div class="absolute flex flex-wrap inset-0 justify-around items-stretch text-xs bg-black/20 z-30">
    {#each numberOfTilesToEdge[debugIndex] as e, i}
      {#if i === 4}
      <div class="w-1/3 text-center text-red-500">{debugIndex}</div>
      {/if}
      <div class="w-1/3 text-center">{e}</div>
    {/each}
  </div> -->
</div>
