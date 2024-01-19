<script lang="ts">
	import HeroSectionIllustration from '$components/HeroSectionIllustration.svelte';

	let textValue: string = '';
	let roomCodeValue: string = '';
</script>

<main class="h-screen flex items-center justify-evenly">
	<div class="">
		<h1 class="text-5xl font-bold">Blud,<br /> what is this move called?</h1>
		<input type="text" placeholder="Enter your answer" bind:value={textValue} />
		<input type="text" placeholder="Room code" bind:value={roomCodeValue} />
		<button class="btn btn-primary">Enter Room</button>
	</div>
	<HeroSectionIllustration />
</main>
