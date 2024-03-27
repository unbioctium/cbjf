export default class WriteStream {
    #data = [];
    write(data) {
        const list = this.#data;
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
        const list = this.#data;
        if ((length ||= 0) <= 0) {
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
