// Mobile-only: whether the tool sidebar is shown as an open overlay.
// Collapsed by default -- on a narrow viewport the sidebar would otherwise
// cover most/all of the map (see Toolbar.svelte's mobile media query), which
// is what makes the map impossible to pan around on a phone until you close
// it. Desktop layout ignores this entirely (sidebar is always shown, laid
// out in flow).
let open = $state(false);

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
