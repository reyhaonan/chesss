
<!-- Graphical only -->

<div class="grid grid-cols-8 aspect-square rounded-md overflow-hidden border-neutral-800 relative">
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
  {#each board as file, i}
    {#each file as tile, j}
      <div class={`w-20 aspect-square ${(i + j) % 2 == 0?"bg-stone-300":"bg-stone-500"}`}></div> 
    {/each}
  {/each}

  <slot/>

  <slot name="picker"/>
</div>



<script lang="typescript">
  let alphabet = ["a","b","c","d","e","f","g", "h"]
  // 8x8 2d array
  var board = [...Array(8)].map(e => Array(8));
</script>