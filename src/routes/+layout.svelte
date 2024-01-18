<script>
	import LeftSidebar from "$components/LeftSidebar.svelte";
	import Navbar from "$components/Navbar.svelte";
	import RightSidebar from "$components/RightSidebar.svelte";
  import "$lib/app.css";
</script>

<div class="grid grid-cols-12 h-screen pb-3 overflow-hidden">
	<Navbar/>
	<LeftSidebar/>
	<main class="col-span-6">
		<div class="w-full my-8">
			<slot/>
		</div>
	</main>
	<RightSidebar/>
</div>