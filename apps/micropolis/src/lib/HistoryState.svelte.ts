let open = $state(false);

export const historyState = {
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
