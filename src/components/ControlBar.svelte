<div class="w-full p-2">
  <Button on:click={flip}>
    <span class="material-icons">sync</span>
  </Button>
</div>

<script lang="ts">
  import Button from "./Button.svelte";
  import flipBoard from "$stores/FlipBoard"

  const flip = () => {
    flipBoard.switchValue()
  }
</script>