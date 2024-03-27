import { deflate, inflate } from "pako";
import UTF8 from "./UTF8.js";
import ReadStream from "./ReadStream.js";
import WriteStream from "./WriteStream.js";
function isArrayBuffer(obj) {
    try {
        new DataView(obj, 0, 0);
        return true;
    }
    catch (err) {
        return false;
    }
}
function getSafeArrayBuffer(view) {
    const buffer = view.buffer;
    const offset = view.byteOffset;
    const length = view.byteLength;
    if (offset === 0 && length === buffer.byteLength)
        return buffer;
    else
        return buffer.slice(offset, offset + length);
}
function encodeStringData(str, v) {
    const buffer = UTF8.encode(v);
    const view = new DataView(new ArrayBuffer(4), 0, 4);
    view.setUint32(0, buffer.byteLength, true);
    str.write(view);
    str.write(buffer);
}
function encodeBuffer(str, v) {
    const view = new DataView(new ArrayBuffer(5), 0, 5);
    view.setUint8(0, 102 /* DataID.binary */);
    view.setUint32(1, v.byteLength, true);
    str.write(view);
    str.write(v);
}
function encodeObject(str, v) {
    if (typeof v.toJSON === "function") {
        encodeValue(str, v.toJSON());
        return;
    }
    const keys = Object.keys(v);
    {
        const view = new DataView(new ArrayBuffer(5), 0, 5);
        view.setUint8(0, 100 /* DataID.object */);
        view.setUint32(1, keys.length, true);
        str.write(view);
    }
    for (const key of keys) {
        const value = v[key];
        switch (typeof value) {
            case "boolean":
            case "bigint":
            case "number":
            case "object":
            case "string":
            case "undefined":
                encodeStringData(str, key);
                encodeValue(str, value);
            default:
                break; // ignore
        }
    }
}
function encodeArray(str, v) {
    const view = new DataView(new ArrayBuffer(5), 0, 5);
    view.setUint8(0, 99 /* DataID.array */);
    view.setUint32(1, v.length, true);
    str.write(view);
    for (const e of v)
        encodeValue(str, e);
}
function encodeValue(str, v) {
    switch (typeof v) {
        case "string":
            str.write(101 /* DataID.string */);
            encodeStringData(str, v);
            break;
        case "boolean":
            str.write([10 /* DataID.uint8 */, v ? 1 : 0]);
            break;
        case "undefined":
            str.write(0 /* DataID.Void */);
            break;
        case "number":
            {
                if (Number.isSafeInteger(v)) {
                    if (v >= 0) {
                        if (v <= 0xff) {
                            const view = new DataView(new ArrayBuffer(2), 0, 2);
                            view.setUint8(0, 10 /* DataID.uint8 */);
                            view.setUint8(1, v);
                            str.write(view);
                            return;
                        }
                        if (v <= 0xffff) {
                            const view = new DataView(new ArrayBuffer(3), 0, 3);
                            view.setUint8(0, 11 /* DataID.uint16 */);
                            view.setUint16(1, v, true);
                            str.write(view);
                            return;
                        }
                        if (v <= 0xffff_ffff) {
                            const view = new DataView(new ArrayBuffer(5), 0, 5);
                            view.setUint8(0, 12 /* DataID.uint32 */);
                            view.setUint32(1, v, true);
                            str.write(view);
                            return;
                        }
                    }
                    else {
                        if (v >= -0x80 && v < 0x80) {
                            const view = new DataView(new ArrayBuffer(2), 0, 2);
                            view.setUint8(0, 20 /* DataID.int8 */);
                            view.setInt8(1, v);
                            str.write(view);
                            return;
                        }
                        if (v >= -0x8000 && v < 0x8000) {
                            const view = new DataView(new ArrayBuffer(3), 0, 3);
                            view.setUint8(0, 21 /* DataID.int16 */);
                            view.setInt16(1, v, true);
                            str.write(view);
                            return;
                        }
                        if (v >= -0x8000_0000 && v < 0x8000_0000) {
                            const view = new DataView(new ArrayBuffer(5), 0, 5);
                            view.setUint8(0, 22 /* DataID.int32 */);
                            view.setInt32(1, v, true);
                            str.write(view);
                            return;
                        }
                    }
                }
                const view = new DataView(new ArrayBuffer(9), 0, 9);
                view.setUint8(0, 33 /* DataID.float64 */);
                view.setFloat64(1, v, true);
                str.write(view);
            }
            break;
        case "bigint":
            {
                const view = new DataView(new ArrayBuffer(9), 0, 9);
                if (v >= 0n) {
                    view.setUint8(0, 13 /* DataID.uint64 */);
                    view.setBigUint64(1, v, true);
                }
                else {
                    view.setUint8(0, 23 /* DataID.int64 */);
                    view.setBigUint64(1, v, true);
                }
                str.write(view);
            }
            break;
        case "object":
            if (v === null)
                str.write(255 /* DataID.Null */);
            else if (Array.isArray(v))
                encodeArray(str, v);
            else if (isArrayBuffer(v))
                encodeBuffer(str, v);
            else if (ArrayBuffer.isView(v))
                encodeBuffer(str, getSafeArrayBuffer(v));
            else
                encodeObject(str, v);
            break;
        default:
            break;
    }
}
export function encode(data, options) {
    if (typeof data !== "object" || data == null)
        throw new Error("Data must be a non-null object or array.");
    if (typeof (options ||= {}) !== "object")
        throw new Error("The options parameter must be an object.");
    {
        const s = new WriteStream();
        encodeValue(s, data);
        data = s.toArrayBuffer();
    }
    const cpm = options.compressMethod || 0 /* CBJF.CompressMethod.none */;
    const cpl = options.compressLevel || 5 /* CBJF.CompressLevel.NORMAL */;
    switch (cpm) {
        case 0 /* CBJF.CompressMethod.none */:
            break;
        case 1 /* CBJF.CompressMethod.DEFLATE */:
            data = deflate(data, {
                raw: true,
                level: cpl,
                memLevel: 9,
                chunkSize: 8192,
                windowBits: 15
            });
            break;
        case 3 /* CBJF.CompressMethod.GZIP */:
            data = deflate(data, {
                gzip: true,
                level: cpl,
                memLevel: 9,
                chunkSize: 8192,
                windowBits: 15
            });
            break;
        case 2 /* CBJF.CompressMethod.BZIP2 */:
        case 4 /* CBJF.CompressMethod.LZ4 */:
        case 5 /* CBJF.CompressMethod.XZ */:
        case 6 /* CBJF.CompressMethod.ZSTD */:
            throw new Error("Not implemented");
        default:
            throw new Error("Unknown compress method: " + cpm);
    }
    const buffer = new Uint8Array(new ArrayBuffer(data.byteLength + 7));
    buffer[0] = 0x80;
    buffer[1] = 0x63;
    buffer[2] = 0x62;
    buffer[3] = 0x6a;
    buffer[4] = 0x66;
    buffer[5] = 0x01;
    buffer[6] = cpm;
    buffer.set(new Uint8Array(data), 7);
    return buffer.buffer;
}
function decodeArray(str) {
    const length = new DataView(str.readNBytes(4), 0, 4).getUint32(0, true);
    const array = new Array(length);
    for (let i = 0; i < length; i++)
        array[i] = decodeValue(str);
    return array;
}
function decodeObject(str) {
    const length = new DataView(str.readNBytes(4), 0, 4).getUint32(0, true);
    const object = Object.create(null);
    for (let i = 0; i < length; i++)
        object[UTF8.decode(str.readNBytes(new DataView(str.readNBytes(4), 0, 4).getUint32(0, true)))] = decodeValue(str);
    return object;
}
function decodeValue(str) {
    const id = str.read();
    switch (id) {
        case 0 /* DataID.Void */:
            return;
        case 255 /* DataID.Null */:
            return null;
        case 10 /* DataID.uint8 */:
            return str.read();
        case 11 /* DataID.uint16 */:
            return new DataView(str.readNBytes(2), 0, 2).getUint16(0, true);
        case 12 /* DataID.uint32 */:
            return new DataView(str.readNBytes(4), 0, 4).getUint32(0, true);
        case 13 /* DataID.uint64 */:
            return new DataView(str.readNBytes(8), 0, 8).getBigUint64(0, true);
        case 20 /* DataID.int8 */:
            return (str.read() << 8) >> 8;
        case 21 /* DataID.int16 */:
            return new DataView(str.readNBytes(2), 0, 2).getInt16(0, true);
        case 22 /* DataID.int32 */:
            return new DataView(str.readNBytes(4), 0, 4).getInt32(0, true);
        case 23 /* DataID.int64 */:
            return new DataView(str.readNBytes(8), 0, 8).getBigInt64(0, true);
        case 32 /* DataID.float32 */:
            return new DataView(str.readNBytes(4), 0, 4).getFloat32(0, true);
        case 33 /* DataID.float64 */:
            return new DataView(str.readNBytes(8), 0, 8).getFloat64(0, true);
        case 99 /* DataID.array */:
            return decodeArray(str);
        case 100 /* DataID.object */:
            return decodeObject(str);
        case 101 /* DataID.string */:
            return UTF8.decode(str.readNBytes(new DataView(str.readNBytes(4), 0, 4).getUint32(0, true)));
        case 102 /* DataID.binary */:
            return str.readNBytes(new DataView(str.readNBytes(4), 0, 4).getUint32(0, true));
        default:
            throw new Error("Parse Error: Invalid data ID: " + id);
    }
}
export function decode(data, options) {
    if (typeof (options || {}) !== "object")
        throw new Error("The options parameter must be an object.");
    if (ArrayBuffer.isView(data))
        data = getSafeArrayBuffer(data);
    if (!isArrayBuffer(data))
        throw new Error("The data parameter must be an ArrayBuffer.");
    {
        const view = new Uint8Array(data, 0, data.byteLength);
        if (view[0] !== 0x80 || view[1] !== 0x63 || view[2] !== 0x62 ||
            view[3] !== 0x6a || view[4] !== 0x66 || view[5] !== 0x01)
            throw new Error("Parse Error: Input data is not valid.");
        switch (view[6]) {
            case 0 /* CBJF.CompressMethod.none */:
                data = data.slice(7);
                break;
            case 1 /* CBJF.CompressMethod.DEFLATE */:
                data = inflate(data.slice(7), {
                    raw: true,
                    chunkSize: 8192,
                    windowBits: 15
                }).buffer;
                break;
            case 3 /* CBJF.CompressMethod.GZIP */:
                data = inflate(data.slice(7), {
                    chunkSize: 8192,
                    windowBits: 15
                }).buffer;
                break;
            case 2 /* CBJF.CompressMethod.BZIP2 */:
            case 4 /* CBJF.CompressMethod.LZ4 */:
            case 5 /* CBJF.CompressMethod.XZ */:
            case 6 /* CBJF.CompressMethod.ZSTD */:
                throw new Error("Not implemented");
            default:
                throw new Error("Parse Error: Unknown compress method.");
        }
    }
    return decodeValue(new ReadStream(data));
}
