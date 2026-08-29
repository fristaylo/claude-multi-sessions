export const MARK = "__multiClaudeProvider";

const ANCHOR = /registerWebviewViewProvider\(\s*"claudeVSCodeSidebar"\s*,\s*([A-Za-z_$][\w$]*)\s*,/;

export function patchSource(src: string): string | null {
	if (src.includes(MARK)) return null;
	const m = ANCHOR.exec(src);
	if (!m) return null;
	return src.replace(
		ANCHOR,
		`registerWebviewViewProvider("claudeVSCodeSidebar",(globalThis.${MARK}=${m[1]}),`,
	);
}

export function isPatched(src: string): boolean {
	return src.includes(MARK);
}
