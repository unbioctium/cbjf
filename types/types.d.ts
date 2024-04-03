/// <reference lib="es2015" />

declare global {
	export type nul = null | undefined | void;
}

declare module CBJF {
	export const enum CompressMethod {
		none = 0,
		DEFLATE = 1,
		BZIP2 = 2,
		GZIP = 3,
		LZ4 = 4,
		XZ = 5,
		ZSTD = 6
	}
	export const enum CompressLevel {
		FASTEST = 1,
		FAST = 3,
		NORMAL = 5,
		MAXIMUM = 7,
		ULTRA = 9
	}
	export interface EncodeOptions {
		/** @default none */
		compressMethod?: CompressMethod | nul;
		/** @default NORMAL */
		compressLevel?: CompressLevel | nul;
	}
	export interface DecodeOptions {
	}

	/**
	 * Encode (serialize) an object into a CBJF-formatted `ArrayBuffer`. This function
	 * uses a serializing strategy similar to `JSON.stringify`, which invokes the `toJSON`
	 * function within an object if one is present. However this function will serialize
	 * `bigint` values as normal instead of throwing an error (as `JSON.stringify` does).
	 * @param data The value to encode. This value must be a non-null object or array.
	 * @param options Additional formatting options for encoding.
	 */
	export function encode(data: any, options?: EncodeOptions | nul): ArrayBuffer;
	/**
	 * Decode (deserialize) a CBJF-formatted `ArrayBuffer` into an object.
	 * @param data The binary data to decode.
	 * @param options Additional formatting options for decoding.
	 */
	export function decode(data: ArrayBuffer, options?: DecodeOptions | nul): any;
}

export = CBJF;
export default CBJF;