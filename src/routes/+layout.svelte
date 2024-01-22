<script>
	import '$lib/app.css';

	
  import { blur } from 'svelte/transition'


	export let data
</script>


{#key data.url}
  <div
    transition:blur={{ amount: 10 }}
  >
    <slot />
  </div>
{/key}