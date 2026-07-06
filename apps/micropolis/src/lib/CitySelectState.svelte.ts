let open = $state(false);

export const citySelectState = {
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
