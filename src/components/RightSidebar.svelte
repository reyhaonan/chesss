<script>
	import BoardHistory from './BoardHistory.svelte';
	import ControlBar from './ControlBar.svelte';
	import Timer from './Timer.svelte';
</script>

<div class="col-span-3 bg-primary/5 px-6 py-16">
<!--	<Timer remainingTime={Date.now() + 1000 * 90} />-->
	<ControlBar />
	<BoardHistory />
<!--	<Timer remainingTime={Date.now() + 1000 * 90} />-->
</div>
