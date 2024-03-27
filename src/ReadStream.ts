export default class ReadStream {
	readonly #buffer: ArrayBufferLike;

	#index: number = 0;

	constructor(buffer: ArrayBufferLike | ArrayBufferView) {
		if (ArrayBuffer.isView(buffer))
			this.#buffer = buffer.buffer;
		else
			this.#buffer = new DataView(buffer, 0, 0).buffer;
	}

	read(): number {
		return new Uint8Array(this.#buffer)[this.#index++]
	}

	readNBytes(n: number): ArrayBuffer {
		const buffer = this.#buffer;
		const length = buffer.byteLength;

		const start = this.#index;
		if (start >= length)
			return new ArrayBuffer(0);

		const end = this.#index += n;
		if (end > length)
			return buffer.slice(start, length);
		else
			return buffer.slice(start, end);
	}
}