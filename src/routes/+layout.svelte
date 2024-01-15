<script>
	import LeftSidebar from "$components/LeftSidebar.svelte";
	import Navbar from "$components/Navbar.svelte";
	import RightSidebar from "$components/RightSidebar.svelte";
  import "$lib/app.css";
</script>

<!-- <Navbar/> -->
<div class="grid grid-cols-12 h-screen">
	<LeftSidebar/>
	<main class="content col-span-6">
		<div class="w-full flex items-center justify-center my-8">
			<slot/>
		</div>
	</main>
	<RightSidebar/>
</div>