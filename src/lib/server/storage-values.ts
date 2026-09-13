import protobuf from 'protobufjs';

// The CommonJS package does not expose Reader as a named export during SSR.
// eslint-disable-next-line import/no-named-as-default-member
const { Reader } = protobuf;

/** Read one complete numeric scalar from the native key/value store. */
export function storageNumber(value: Uint8Array): number | null {
	if (value.length < 2 || value.length > 11) return null;
	try {
		const reader = Reader.create(value);
		const tag = reader.uint32();
		const number =
			tag === 16 ? reader.int32() : tag === 25 ? reader.double() : null;
		return number !== null &&
			reader.pos === reader.len &&
			Number.isFinite(number)
			? number
			: null;
	} catch {
		return null;
	}
}
