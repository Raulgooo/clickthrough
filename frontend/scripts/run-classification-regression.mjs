import assert from "node:assert/strict";
import vm from "node:vm";
import ts from "typescript";
import { readFileSync } from "node:fs";

let source = readFileSync(new URL("../src/harness/runtime/openrouter.ts", import.meta.url), "utf8");
source = source
  .replace(/^import type .*$/gm, "")
  .replace(/^import .*validateGeneratedUi.*$/gm, "const validateGeneratedUi = () => ({ valid: true });")
  .replace(/^import .*providerFetch.*$/gm, "const providerFetch = async () => { throw new Error('network disabled'); };")
  .replace(/import\.meta\.env/g, "({})");

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
  URL,
});

assert.equal(
  typeof module.exports.heuristicClassify,
  "function",
  "heuristicClassify should be exported for regression coverage"
);

const socialPage = {
  title: "Raul R. Gonzalez (@raulgcc1) / X",
  url: "https://x.com/raulgcc1",
  visibleText: "Raul R. Gonzalez @raulgcc1 Follow Posts Replies Media",
  selectedText: "",
};

const result = module.exports.heuristicClassify("investigate who is this guy?", socialPage);

assert.equal(result.family, "understand");
assert.equal(result.needsWebSearch, true);
assert.equal(result.needsDomActions, false);

console.log("classification regression checks passed");
