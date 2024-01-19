<script lang="ts">
	export let remainingTime: number = Date.now() + 1000 * 30;

	let now = Date.now();
	const updateTimer = () => {
		now = Date.now();
	};

	$: count = Math.round((remainingTime - now) / 1000);
	$: h = Math.floor(count / 3600);
	$: m = Math.floor((count - h * 3600) / 60);
	$: s = count - h * 3600 - m * 60;

	let interval = setInterval(updateTimer, 1000);
	$: if (count === 0) clearInterval(interval);

	const padValue = (value: number, length = 2, char = '0') => {
		const { length: currentLength } = value.toString();
		if (currentLength >= length) return value.toString();
		return `${char.repeat(length - currentLength)}${value}`;
	};
</script>

<div class="border-primary/40 text-neutral-50 p-2 text-3xl font-bold">
	{padValue(h)}:{padValue(m)}:{padValue(s)}
</div>
