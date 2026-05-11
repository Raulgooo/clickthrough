import assert from "node:assert/strict";
import vm from "node:vm";
import ts from "typescript";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/harness/runtime/validateUi.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const module = { exports: {} };
vm.runInNewContext(transpiled.outputText, {
  exports: module.exports,
  module,
  console,
});

const { validateGeneratedUi } = module.exports;

function assertInvalid(node, label) {
  const result = validateGeneratedUi(node);
  assert.equal(result.valid, false, `${label} should be invalid`);
}

assertInvalid(
  { type: "IdentityCard", props: { aliases: ["@raulgcc1"] } },
  "IdentityCard missing name"
);
assertInvalid({ type: "InlineQuote", props: {} }, "InlineQuote missing quote");
assertInvalid({ type: "CodeBlock", props: {} }, "CodeBlock missing code");

console.log("validateUi regression checks passed");
