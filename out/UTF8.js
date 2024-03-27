const UTF8 = {
    encode: (text) => {
        const codePoints = Array.from(text).map((char) => char.codePointAt(0) || 0);
        const bytes = [];
        for (const codePoint of codePoints) {
            if (codePoint <= 0x7f) {
                bytes.push(codePoint);
            }
            else if (codePoint <= 0x7ff) {
                bytes.push((codePoint >> 6) | 0xc0);
                bytes.push((codePoint & 0x3f) | 0x80);
            }
            else if (codePoint <= 0xffff) {
                bytes.push((codePoint >> 12) | 0xe0);
                bytes.push(((codePoint >> 6) & 0x3f) | 0x80);
                bytes.push((codePoint & 0x3f) | 0x80);
            }
            else if (codePoint <= 0x10ffff) {
                bytes.push((codePoint >> 18) | 0xf0);
                bytes.push(((codePoint >> 12) & 0x3f) | 0x80);
                bytes.push(((codePoint >> 6) & 0x3f) | 0x80);
                bytes.push((codePoint & 0x3f) | 0x80);
            }
        }
        return Uint8Array.from(bytes).buffer;
    },
    decode: (data) => {
        const bytes = new Uint8Array(data);
        let str = '';
        let i = 0;
        while (i < bytes.length) {
            const byte1 = bytes[i];
            if ((byte1 & 0x80) === 0) {
                // Single-byte character (0xxxxxxx)
                str += String.fromCharCode(byte1);
                i += 1;
            }
            else if ((byte1 & 0xe0) === 0xc0) {
                // Two-byte character (110xxxxx 10xxxxxx)
                const byte2 = bytes[i + 1];
                str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
                i += 2;
            }
            else if ((byte1 & 0xf0) === 0xe0) {
                // Three-byte character (1110xxxx 10xxxxxx 10xxxxxx)
                const byte2 = bytes[i + 1];
                const byte3 = bytes[i + 2];
                str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
                i += 3;
            }
            else if ((byte1 & 0xf8) === 0xf0) {
                // Four-byte character (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
                const byte2 = bytes[i + 1];
                const byte3 = bytes[i + 2];
                const byte4 = bytes[i + 3];
                const codePoint = ((byte1 & 0x07) << 18) |
                    ((byte2 & 0x3f) << 12) |
                    ((byte3 & 0x3f) << 6) |
                    (byte4 & 0x3f);
                // Check if the code point is valid (within Unicode range)
                if (codePoint <= 0x10ffff) {
                    str += String.fromCodePoint(codePoint);
                }
                else {
                    // Invalid code point, skip it
                    str += '\ufffd'; // Replace with the replacement character
                }
                i += 4;
            }
            else {
                // Invalid UTF-8 sequence, skip the byte
                str += '\ufffd'; // Replace with the replacement character
                i += 1;
            }
        }
        return str;
    }
};
export default UTF8;
