export function disableRightClick(node: HTMLElement) {
	const handleClick = (event: MouseEvent) => {
		event.preventDefault()
	};

	node.addEventListener('contextmenu', handleClick, true);

	return {
		destroy() {
			node.removeEventListener('contextmenu', handleClick, true);
		}
	};
}
