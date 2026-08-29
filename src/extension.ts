import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as vscode from "vscode";
import { MARK, isPatched, patchSource } from "./patch";

const CLAUDE_ID = "Anthropic.claude-code";
const SLOTS = 5;

export async function activate(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.commands.registerCommand("multiClaude.restore", restore));

	const claude = vscode.extensions.getExtension(CLAUDE_ID);
	if (!claude) {
		vscode.window.showErrorMessage("MultiClaude: the Claude Code extension is not installed.");
		return;
	}

	if (!ensurePatched(join(claude.extensionPath, "extension.js"))) return;

	await claude.activate();
	const provider = (globalThis as any)[MARK] as vscode.WebviewViewProvider | undefined;
	if (!provider) {
		askReload("MultiClaude: could not capture the Claude Code webview provider.");
		return;
	}

	for (let i = 1; i <= SLOTS; i++) {
		ctx.subscriptions.push(
			vscode.window.registerWebviewViewProvider(`multiClaude.session${i}`, provider, {
				webviewOptions: { retainContextWhenHidden: true },
			}),
		);
	}
}

function ensurePatched(bundle: string): boolean {
	let src: string;
	try {
		src = readFileSync(bundle, "utf8");
	} catch (e) {
		vscode.window.showErrorMessage(`MultiClaude: cannot read ${bundle}: ${e}`);
		return false;
	}
	if (isPatched(src)) return true;

	const patched = patchSource(src);
	if (!patched) {
		vscode.window.showErrorMessage(
			"MultiClaude: sidebar registration site not found in Claude Code — unsupported version.",
		);
		return false;
	}
	try {
		copyFileSync(bundle, `${bundle}.multiclaude.bak`);
		writeFileSync(bundle, patched);
	} catch (e) {
		vscode.window.showErrorMessage(`MultiClaude: cannot write ${bundle}: ${e}`);
		return false;
	}
	askReload("MultiClaude hooked into Claude Code. Reload the window to get your sessions.");
	return false;
}

function restore() {
	const claude = vscode.extensions.getExtension(CLAUDE_ID);
	const bak = claude && `${join(claude.extensionPath, "extension.js")}.multiclaude.bak`;
	if (!bak || !existsSync(bak)) {
		vscode.window.showWarningMessage("MultiClaude: no backup found.");
		return;
	}
	copyFileSync(bak, bak.replace(/\.multiclaude\.bak$/, ""));
	askReload("MultiClaude: the original Claude Code bundle has been restored.");
}

function askReload(message: string) {
	vscode.window.showInformationMessage(message, "Reload Window").then((pick) => {
		if (pick) vscode.commands.executeCommand("workbench.action.reloadWindow");
	});
}

export function deactivate() {}
