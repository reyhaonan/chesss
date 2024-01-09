
<!-- Graphical only -->

<div class="grid grid-cols-8 aspect-square border-4 border-neutral-800 relative">
  <!-- Indication row -->
  <div class="h-full absolute flex flex-col-reverse justify-around right-full top-0 text-neutral-50">
    {#each Array(8) as num, i}
      <div class="pr-4">{i + 1}</div>
    {/each}
  </div>
  <div class="w-full absolute flex justify-around top-full right-0 text-neutral-50">
    {#each alphabet as alp, i}
      <div class="pt-4">{alp}</div>
    {/each}
  </div>
  {#each board as file, i}
    {#each file as tile, j}
      <div class={`w-20 aspect-square ${(i + j) % 2 == 0?"bg-emerald-100":"bg-emerald-600"}`}></div> 
    {/each}
  {/each}

  <div class="absolute inset-0 grid grid-cols-8 grid-rows-8">
    <slot/>
  </div>
</div>



<script lang="typescript">
  let alphabet = ["a","b","c","d","e","f"]
  // 8x8 2d array
  var board = [...Array(8)].map(e => Array(8));
</script>