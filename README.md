# CBJF
Compressed Binary JSON File (CBJF) is a file format that encodes plain JSON data tree into binary form. This library contains a pure JavaScript implementation of encoding and decoding CBJF files.

## Install
```sh
npm install cbjf@latest
```

## Example Usage
Serialize an object:
```javascript
import fs from "fs";
import { encode } from "cbjf";

const object = {
  id: 2,
  name: "Example",
  labels: [
    "label1",
    "label2"
  ],
  date: 1711541064326n,
  image: new ArrayBuffer(100)
};

const arrayBuffer = encode(object);

fs.writeFileSync("out.cbjf", Buffer.from(arrayBuffer), "utf-8");
```

Serialize with compression enabled:
```javascript
import fs from "fs";
import { encode } from "cbjf";

const object = {
  id: 2,
  name: "Example",
  labels: [
    "label1",
    "label2"
  ],
  date: 1711541064326n,
  image: new ArrayBuffer(100)
};

const arrayBuffer = encode(object, {
	compressLevel: 5,
	compressMethod: 1 // DEFLATE
});

fs.writeFileSync("out.cbjf", Buffer.from(arrayBuffer), "utf-8");
```

Use the CLI tool:
```sh
# Install the package globally
npm install -g cbjf@latest

# Convert a JSON file to a CBJF file
cbjf -e file.json file.cbjf

# Convert a CBJF file to a JSON file
cbjf -d file.cbjf file.json
```

## License
This repository is licensed under the GPL-3.0 License. See `LICENSE.md` for more detailed license terms.

## FAQs
### What is a CBJF file? How is it different from JSON?
A CBJF file is a new file format to store JSON-like data in binary form. It removes useless bits of JSON (quotes, brackets, comments, whitespaces) to reduce the overall file size and improve the parsing performance. It also supports compressing to further shrink down the file size.

### What kind of value can be serialized?
CBJF currently supports encoding all values serializable by `JSON.stringify`, plus `bigint`, `ArrayBuffer` and `ArrayBufferView`.

### Which compress algorithm can be used with CBJF?
All compress methods supported by a standard CBJF file are listed in the `CompressMethod` enum in `./types/types.d.ts`. However due to lack of pure JavaScript implementations for certain algorithms, only `DEFLATE` and `GZIP` are supported by this library at this moment.
