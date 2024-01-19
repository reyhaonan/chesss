<script lang="ts">
	export let disabled = false;
</script>

<button
	on:click
	on:blur
	{disabled}
	class="flex items-center justify-center w-10 aspect-square transition-all {!disabled &&
		'hover:bg-primary/20 active:bg-primary/40'} rounded-lg"
>
	<slot />
</button>
