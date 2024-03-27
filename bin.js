import fs from "fs";
import Path from "path";
import cbjf from "./main.js";
import process from "process";

const [node, js, ...args] = process.argv;
const { stdin, stdout, stderr } = process;

stdin.setEncoding("utf-8");
stdin.setDefaultEncoding("utf-8");
stdout.setEncoding("utf-8");
stdout.setDefaultEncoding("utf-8");
stderr.setEncoding("utf-8");
stderr.setDefaultEncoding("utf-8");

let encode = true;
let compress = false;
let inputFile = null;
let outputFile = null;

for (const arg of args) {
	if (arg[0] === "-") {
		const op = arg[1] === "-" ? arg.slice(2) : arg.slice(1);
		switch (op) {
			case "help":
				stdout.write("Usage: cbjf [OPTION...] <input-file> <output-file>\n\n");
				stdout.write("\t-e, --encode	Encode the input JSON file into a CBJF file. This option is set by default unless '-d' is specified.\n");
				stdout.write("\t-d, --decode	Decode the input CBJF file into a JSON file.\n");
				stdout.write("\t-z, --compress	Enable CBJF compression when encoding.\n");;
				stdout.write("\t--help			Show this help message and exit.\n");
				stdout.write("\t--version		Show version information and exit.\n");
				process.exit(0);
				break;
			case "version":
				stdout.write((await import("./package.json", { assert: { type: 'json' } })).default.version + "\n");
				process.exit(0);
				break;
			case "e":
			case "encode":
				encode = true;
				continue;
			case "d":
			case "decode":
				encode = false;
				continue;
			case "z":
			case "compress":
				compress = true;
				continue;
			default:
				stderr.write("cbjf: Error: Invalid option: -" + op + "\n");
				stderr.write("Try 'cbjf --help' for more information.\n");
				process.exit(1);
				break;
		}
	}

	if (inputFile == null) {
		inputFile = arg;
		continue;
	}

	if (outputFile == null) {
		outputFile = arg;
		continue;
	}

	stderr.write("cbjf: Error: Invalid arguments.\n");
	stderr.write("Try 'cbjf --help' for more information.\n");
	process.exit(1);
}

if (inputFile == null) {
	stderr.write("cbjf: Error: Input file must be specified.\n");;
	process.exit(1);
}
if (!fs.existsSync(inputFile = Path.resolve(inputFile))) {
	stderr.write("cbjf: Error: Input file does not exist.\n");
	process.exit(1);
}
if (fs.lstatSync(inputFile, { bigint: true, throwIfNoEntry: true }).isDirectory()) {
	stderr.write("cbjf: Error: Input file must not be a directory.\n");
	process.exit(1);
}

if (outputFile == null) {
	const base = Path.join(Path.dirname(inputFile), Path.basename(inputFile, Path.extname(inputFile)));
	if (encode)
		outputFile = base + ".cbjf";
	else
		outputFile = base + ".json";
} else outputFile = Path.resolve(outputFile);


if (encode) {
	try {
		encode = fs.readFileSync(inputFile, "utf-8");
		encode = JSON.parse(encode, void 0);
	} catch (err) {
		stderr.write("cbjf: Error: Failed to parse the input file as JSON.\n");
		process.exit(1);
	}

	if (compress) {
		encode = cbjf.encode(encode, {
			compressMethod: 1,
			compressLevel: 5
		});
	} else {
		encode = cbjf.encode(encode, {
			compressMethod: 0
		});
	}

	fs.writeFileSync(outputFile, Buffer.from(encode), {
		mode: 0o600,
		flush: true
	});
} else {
	try {
		encode = fs.readFileSync(inputFile);
	} catch (err) {
		stderr.write("cbjf: Error: Failed to read the input file.\n");
		process.exit(1);
	}

	fs.writeFileSync(outputFile, JSON.stringify(cbjf.decode(encode), void 0, "\t"), {
		mode: 0o600,
		flush: true,
		encoding: "utf-8"
	});
}
