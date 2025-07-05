<script lang="typescript">
	import { disableRightClick } from '$lib/disableRightClick';
	import { fileArray, rankArray } from '$lib/misc';
	import flipBoard from '$stores/FlipBoard';

	const reversedRank = [...rankArray].reverse();
	const reversedFile = [...fileArray].reverse();

	$: rankToUse = $flipBoard ? reversedRank : rankArray;
	$: fileToUse = $flipBoard ? reversedFile : fileArray;
</script>

<!-- Graphical only -->

<div
	class="h-[80vh] mx-auto aspect-square rounded-md relative bg-cover bg-center"
	style="background-image: url('/chess/board.svg');"
	use:disableRightClick
>
	<!-- Indication row -->
	<div class="h-full absolute grid grid-rows-8 justify-around left-0 top-0 font-bold z-10">
		{#each rankToUse as num, i}
			<div class={`pl-1 text-background`}>{num}</div>
		{/each}
	</div>
	<div class="w-full absolute grid grid-cols-8 justify-around bottom-0 left-0 font-bold z-10">
		{#each fileToUse as alp, i}
			<div class={`pb-1 text-right pr-2 text-background`}>{alp}</div>
		{/each}
	</div>
	<!-- {#each board as file, i}
    {#each file as tile, j}
      <div class={`aspect-square ${(i + j) % 2 == 0?"bg-[#e9edcc]":"bg-[#789954]"}`}></div> 
    {/each}
  {/each} -->

	<slot />

	<slot name="picker" />
</div>
