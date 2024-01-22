<script lang="ts">
	import HeroSectionIllustration from '$components/HeroSectionIllustration.svelte';
	import {goto} from "$app/navigation"

	let roomCodeValue: string = '';
	
	const processRoomRequest = () => {
		goto(`/room/${roomCodeValue}`)
	}

</script>


<main class="h-screen flex items-center justify-evenly">
	<div class="space-y-4">
		<h1 class="text-5xl font-bold">Blud,<br /> what is this move called?</h1>
		<input type="text" placeholder="Room code" class="input input-bordered input-md" bind:value={roomCodeValue} />
		<button class="btn btn-primary btn-md ml-2" on:click={processRoomRequest}>Enter Room</button>
	</div>
	<HeroSectionIllustration />
</main>
