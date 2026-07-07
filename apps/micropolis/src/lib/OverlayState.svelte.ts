import type { OverlayMapId } from './wasm/overlayMaps';

let open = $state(false);
let active = $state<OverlayMapId | 'none'>('none');

export const overlayState = {
	get open() {
		return open;
	},
	get active() {
		return active;
	},
	toggle() {
		open = !open;
	},
	close() {
		open = false;
	},
	select(id: OverlayMapId | 'none') {
		active = id;
		open = false;
	}
};
