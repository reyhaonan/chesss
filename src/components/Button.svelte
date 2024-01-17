<button 
  on:click 
  on:blur 
  disabled={disabled} 
  class="flex items-center justify-center w-10  aspect-square transition-all {!disabled && 'hover:bg-slate-600/20 active:bg-slate-600/40'} rounded-lg"
  >
  <slot/>
</button>


<script lang="ts">
  export let disabled = false
</script>