import * as _ from "./out/main.js";
import { encode, decode } from "./out/main.js";

const $ = Object.seal(Object.setPrototypeOf(_, null));
const __ = Object.freeze(encode);
const ___ = Object.freeze(decode);

export {
	__ as encode,
	___ as decode
};
export default $;