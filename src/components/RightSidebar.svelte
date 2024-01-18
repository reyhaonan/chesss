<div class="col-span-3 bg-primary/5 px-6 py-16">
  <Timer remainingTime={new Date()}/>
  <ControlBar/>
  <BoardHistory/>
  <Timer remainingTime={new Date()}/>
</div>

<script>
	import BoardHistory from "./BoardHistory.svelte";
	import ControlBar from "./ControlBar.svelte";
	import Timer from "./Timer.svelte";

</script>