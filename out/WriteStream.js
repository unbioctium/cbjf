var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WriteStream_data;
class WriteStream {
    constructor() {
        _WriteStream_data.set(this, []);
    }
    write(data) {
        const list = __classPrivateFieldGet(this, _WriteStream_data, "f");
        switch (typeof data) {
            case "number":
                list.push(data);
                break;
            case "object":
                if (Array.isArray(data))
                    list.push(Uint8Array.from(data).buffer);
                else if (ArrayBuffer.isView(data))
                    list.push(data.buffer);
                else
                    list.push(new DataView(data, 0, 0).buffer);
                break;
            default:
                throw new Error("Invalid value: " + data);
        }
    }
    toArrayBuffer(length) {
        const list = __classPrivateFieldGet(this, _WriteStream_data, "f");
        if ((length || (length = 0)) <= 0) {
            for (const c of list)
                length += typeof c === "number" ? 1 : c.byteLength;
        }
        const buffer = new Uint8Array(new ArrayBuffer(length), 0, length);
        length = 0;
        for (const c of list) {
            if (typeof c === "number") {
                buffer[length++] = c;
                continue;
            }
            const size = c.byteLength;
            buffer.set(new Uint8Array(c, 0, size), length);
            length += size;
        }
        return buffer.buffer;
    }
}
_WriteStream_data = new WeakMap();
export default WriteStream;
