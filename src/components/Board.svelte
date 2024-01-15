
<!-- Graphical only -->

<!-- thank you chess.com -->
<div class="w-[640px] aspect-square rounded-md relative bg-cover bg-center" 
style="background-image: url('https://images.chesscomfiles.com/chess-themes/boards/green/200.png');">
  <!-- Indication row -->
  <div class="h-full absolute grid grid-rows-8 justify-around left-0 top-0 text-slate-900 font-semibold">
    {#each Array(8) as num, i}
      <div class="pl-1">{i + 1}</div>
    {/each}
  </div>
  <div class="w-full absolute grid grid-cols-8 justify-around bottom-0 left-0 text-slate-900 font-semibold">
    {#each alphabet as alp, i}
      <div class="pb-1 text-right pr-2">{alp}</div>
    {/each}
  </div>
  <!-- {#each board as file, i}
    {#each file as tile, j}
      <div class={`aspect-square ${(i + j) % 2 == 0?"bg-[#e9edcc]":"bg-[#789954]"}`}></div> 
    {/each}
  {/each} -->

  <slot/>

  <slot name="picker"/>
</div>



<script lang="typescript">
	import { alphabet } from "$lib/misc";

  // 8x8 2d array
  var board = [...Array(8)].map(e => Array(8));
</script>