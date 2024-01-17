<div class="w-full p-2 flex justify-between rounded-t-lg bg-slate-900">
  <Button on:click={flip}>
    <span class="material-icons">sync</span>
  </Button>
  <Button disabled={isFirstPage} on:click={() => boardLookup.firstPage()}>
    <span class="material-icons" class:text-slate-700={isFirstPage}>
      first_page
    </span>
  </Button>
  <Button disabled={isFirstPage} on:click={() => boardLookup.prevPage()}>
    <span class="material-icons" class:text-slate-700={isFirstPage}>
      navigate_before
    </span>
  </Button>
  <Button disabled={isLastPage} on:click={() => boardLookup.nextPage()}>
    <span class="material-icons" class:text-slate-700={isLastPage}>
      navigate_next
    </span>
  </Button>
  <Button disabled={isLastPage} on:click={() => boardLookup.lastPage()}>
    <span class="material-icons" class:text-slate-700={isLastPage}>
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

  $: isFirstPage = $boardLookup.lookup <= 0
  $: isLastPage = $boardLookup.lookup === $boardLookup.current

  const flip = () => {
    flipBoard.switchValue()
  }
</script>