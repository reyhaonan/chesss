{#if !!pieceNumber}
  <img src={`/pawn_default/${pieceNumber}.svg`} class="select-none" alt="">
{/if}

<script lang="ts">
  export let pieceNumber:number = 0;
</script>