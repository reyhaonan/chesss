<div class="w-full py-2 flex justify-between">
  <Button on:click={flip}>
    <span class="material-icons">sync</span>
  </Button>
  <Button on:click={() => boardLookup.firstPage()}>
    <span class="material-icons">
      first_page
    </span>
  </Button>
  <Button on:click={() => boardLookup.prevPage()}>
    <span class="material-icons">
      navigate_before
    </span>
  </Button>
  <Button on:click={() => boardLookup.nextPage()}>
    <span class="material-icons">
      navigate_next
    </span>
  </Button>
  <Button on:click={() => boardLookup.lastPage()}>
    <span class="material-icons">
      last_page
    </span>
  </Button>
  <Button>
    <span class="material-icons">
      add
    </span>
  </Button>
</div>

<script lang="ts">
  import Button from "./Button.svelte";
  import flipBoard from "$stores/FlipBoard"
  import boardLookup from "$stores/BoardLookup";


  const flip = () => {
    flipBoard.switchValue()
  }
</script>