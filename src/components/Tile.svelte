<!-- svelte-ignore a11y-no-static-element-interactions -->
<button
class="w-full flex items-center justify-center relative"
on:click
>
  {#if !!pieceNumber}
    <img src={`/pawn_default/${pieceNumber}.svg`} 
    class="select-none w-4/5 z-20" alt="" draggable="false"/>
  {/if}

  {#if highlightForMoveSuggestion}
    <div class="absolute inset-0 bg-red-600/70 flex items-center justify-center">
      <div class="w-8 bg-red-950/40 rounded-full aspect-square"></div>
    </div>
  {/if}
  {#if highlightSelectedTile}
    <div class="absolute inset-0 bg-amber-500/50"></div>
  {/if}
</button>

<script lang="ts">
  export let pieceNumber:number = 0;
  export let highlightForMoveSuggestion = false
  export let highlightSelectedTile = false
</script>