var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ReadStream_buffer, _ReadStream_index;
class ReadStream {
    constructor(buffer) {
        _ReadStream_buffer.set(this, void 0);
        _ReadStream_index.set(this, 0);
        if (ArrayBuffer.isView(buffer))
            __classPrivateFieldSet(this, _ReadStream_buffer, buffer.buffer, "f");
        else
            __classPrivateFieldSet(this, _ReadStream_buffer, new DataView(buffer, 0, 0).buffer, "f");
    }
    read() {
        var _a, _b;
        return new Uint8Array(__classPrivateFieldGet(this, _ReadStream_buffer, "f"))[__classPrivateFieldSet(this, _ReadStream_index, (_b = __classPrivateFieldGet(this, _ReadStream_index, "f"), _a = _b++, _b), "f"), _a];
    }
    readNBytes(n) {
        const buffer = __classPrivateFieldGet(this, _ReadStream_buffer, "f");
        const length = buffer.byteLength;
        const start = __classPrivateFieldGet(this, _ReadStream_index, "f");
        if (start >= length)
            return new ArrayBuffer(0);
        const end = __classPrivateFieldSet(this, _ReadStream_index, __classPrivateFieldGet(this, _ReadStream_index, "f") + n, "f");
        if (end > length)
            return buffer.slice(start, length);
        else
            return buffer.slice(start, end);
    }
}
_ReadStream_buffer = new WeakMap(), _ReadStream_index = new WeakMap();
export default ReadStream;
