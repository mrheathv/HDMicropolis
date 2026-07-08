let open = $state(false);

export const disasterState = {
	get open() {
		return open;
	},
	toggle() {
		open = !open;
	},
	close() {
		open = false;
	}
};
