import assert from "node:assert";
import { MARK, isPatched, patchSource } from "./patch";

const real =
	'$.subscriptions.push(g$.window.registerWebviewViewProvider("claudeVSCodeSidebar",V,{webviewOptions:{retainContextWhenHidden:!0}})),' +
	'$.subscriptions.push(g$.window.registerWebviewViewProvider("claudeVSCodeSidebarSecondary",V,{webviewOptions:{retainContextWhenHidden:!0}}))';

const out = patchSource(real);
assert.ok(out, "anchor must be found");
assert.ok(out.includes(`(globalThis.${MARK}=V)`), "provider must be captured");
assert.ok(out.includes('"claudeVSCodeSidebarSecondary",V,'), "second registration must stay untouched");
assert.strictEqual(out.match(/globalThis\.__multiClaudeProvider/g)?.length, 1, "exactly one patch");
assert.strictEqual(patchSource(out), null, "patch must be idempotent");
assert.ok(isPatched(out) && !isPatched(real));
assert.strictEqual(patchSource("no anchor here"), null, "no anchor, no patch");
assert.ok(patchSource('registerWebviewViewProvider( "claudeVSCodeSidebar" , $x9 ,{})')?.includes("=$x9)"));

console.log("patch.check: ok");
