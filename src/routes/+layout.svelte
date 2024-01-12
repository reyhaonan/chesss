<script>
  import "$lib/app.css";
</script>

<div class="grid grid-cols-12">
	<div class="sidebar col-span-2">a</div>
	<main class="content col-span-8">

		<div class="w-full flex items-center justify-center my-8">
			<slot/>
		</div>
	</main>
	<div class="sidebar col-span-2">b</div>
</div>