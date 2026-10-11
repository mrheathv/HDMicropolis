// Mobile-only: whether the tool sidebar is shown as an open overlay (see
// Toolbar.svelte's mobile media query). Open by default, same as desktop,
// where the sidebar is just always there. Desktop layout ignores this
// entirely (sidebar is always shown, laid out in flow).
let open = $state(true);

export const toolbarState = {
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
