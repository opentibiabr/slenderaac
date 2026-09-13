export type CacheableFile = {
	size: number;
	modified: Date;
	etag: string;
};

export function weakFileEtag(size: number, mtimeMs: number): string {
	return `W/"${size.toString(16)}-${Math.trunc(mtimeMs).toString(16)}"`;
}

export function fileNotModified(
	request: Request,
	file: CacheableFile,
): boolean {
	const ifNoneMatch = request.headers.get('if-none-match');
	if (
		ifNoneMatch
			?.split(',')
			.map((value) => value.trim())
			.some((value) => value === '*' || value === file.etag)
	)
		return true;
	if (ifNoneMatch) return false;

	const ifModifiedSince = request.headers.get('if-modified-since');
	if (!ifModifiedSince) return false;
	const timestamp = Date.parse(ifModifiedSince);
	return (
		Number.isFinite(timestamp) &&
		Math.floor(file.modified.getTime() / 1000) <= Math.floor(timestamp / 1000)
	);
}

export function attachmentDisposition(
	fileName: string,
	fallbackName: string,
): string {
	const encodedName = encodeURIComponent(fileName).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
	return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}
