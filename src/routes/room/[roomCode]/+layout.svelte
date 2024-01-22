<script>
	import LeftSidebar from '$components/LeftSidebar.svelte';
	import Navbar from '$components/Navbar.svelte';
	import RightSidebar from '$components/RightSidebar.svelte';
</script>

<div class="grid grid-cols-12 h-screen overflow-hidden">
	<Navbar />
	<LeftSidebar />
	<main class="col-span-6">
		<div class="w-full my-8">
			<slot />
		</div>
	</main>
	<RightSidebar />
</div>
