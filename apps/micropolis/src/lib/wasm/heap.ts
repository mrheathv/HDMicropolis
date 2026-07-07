import type { MainModule } from '../../types/micropolisengine.d.js';

type EngineWithHeap = MainModule & { wasmMemory?: WebAssembly.Memory; HEAPU16?: Uint16Array };

/**
 * Uint16 view over Emscripten linear memory.
 *
 * Some Emscripten builds install throwing getters before runtime init, so all
 * property probes stay guarded.
 */
export function heapU16FromEmscriptenModule(engine: EngineWithHeap): Uint16Array | null {
	if (!engine) return null;
	try {
		const w = (engine as { wasmMemory?: WebAssembly.Memory }).wasmMemory;
		if (w?.buffer) return new Uint16Array(w.buffer);
	} catch {
		/* getter unavailable */
	}
	try {
		const h = (engine as { HEAPU16?: Uint16Array }).HEAPU16;
		if (h?.buffer) return h;
	} catch {
		/* getter unavailable */
	}
	return null;
}

/**
 * Uint8 view over Emscripten linear memory (byte-granular map buffers:
 * population/traffic/pollution/crime/land-value/power-grid).
 */
export function heapU8FromEmscriptenModule(engine: EngineWithHeap): Uint8Array | null {
	if (!engine) return null;
	try {
		const w = (engine as { wasmMemory?: WebAssembly.Memory }).wasmMemory;
		if (w?.buffer) return new Uint8Array(w.buffer);
	} catch {
		/* getter unavailable */
	}
	return null;
}

/** Signed Int16 view over Emscripten linear memory (rate-of-growth map, `MapShort8`). */
export function heapI16FromEmscriptenModule(engine: EngineWithHeap): Int16Array | null {
	if (!engine) return null;
	try {
		const w = (engine as { wasmMemory?: WebAssembly.Memory }).wasmMemory;
		if (w?.buffer) return new Int16Array(w.buffer);
	} catch {
		/* getter unavailable */
	}
	return null;
}
