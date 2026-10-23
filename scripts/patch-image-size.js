const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'node_modules', 'image-size', 'dist', 'cjs');

const files = {
  utils: path.join(base, 'types', 'utils.js'),
  lookup: path.join(base, 'lookup.js'),
  detector: path.join(base, 'detector.js'),
};

let applied = 0;

// --- Patch utils.js ---
if (fs.existsSync(files.utils)) {
  let content = fs.readFileSync(files.utils, 'utf8');

  // Add toArr/toBuf helpers (only once)
  if (!content.includes('const toArr =')) {
    content = content.replace(
      "const decoder = new TextDecoder();\n",
      "const decoder = new TextDecoder();\nconst toArr = (input) => {\n  if (Buffer.isBuffer(input)) return Array.from(input);\n  if (input instanceof Uint8Array) return Array.from(input);\n  if (Array.isArray(input)) return input;\n  return Array.from(input || []);\n};\nconst toBuf = (input) => Buffer.from(toArr(input));\n"
    );
    applied++;
  }

  // Fix toUTF8String
  const oldToUTF8 = "const toUTF8String = (input, start = 0, end = input.length) => decoder.decode(input.slice(start, end));";
  const newToUTF8 = "const toUTF8String = (input, start = 0, end = input.length) => decoder.decode(toBuf(input).slice(start, end));";
  if (content.includes(oldToUTF8)) {
    content = content.replace(oldToUTF8, newToUTF8);
    applied++;
  }

  // Fix toHexString
  const oldToHex1 = "const toHexString = (input, start = 0, end = input.length) => input\n    .slice(start, end)\n    .reduce((memo, i) => memo + '0' + i.toString(16).slice(-2), '');";
  const oldToHex2 = "const toHexString = (input, start = 0, end = input.length) => toBuf(input)\n    .slice(start, end)\n    .reduce((memo, i) => memo + '0' + i.toString(16).slice(-2), '');";
  const newToHex = "const toHexString = (input, start = 0, end = input.length) => toBuf(input)\n    .slice(start, end)\n    .reduce((memo, i) => memo + '0' + i.toString(16).slice(-2), '');";
  if (content.includes(oldToHex1)) {
    content = content.replace(oldToHex1, newToHex);
    applied++;
  } else if (content.includes(oldToHex2)) {
    content = content.replace(oldToHex2, newToHex);
    applied++;
  }

  // Fix getView
  const oldGetView = "const getView = (input, offset) => new DataView(input.buffer, input.byteOffset + offset);";
  const newGetView = "const getView = (input, offset) => { const b = toBuf(input); return new DataView(b.buffer, b.byteOffset + offset); };";
  if (content.includes(oldGetView)) {
    content = content.replace(oldGetView, newGetView);
    applied++;
  }

  fs.writeFileSync(files.utils, content, 'utf8');
}

// --- Patch lookup.js: accept file path strings ---
if (fs.existsSync(files.lookup)) {
  let content = fs.readFileSync(files.lookup, 'utf8');

  // Add fs import if not present
  if (!content.includes("const fs_1 = require(")) {
    content = content.replace(
      '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.disableTypes = void 0;\nexports.imageSize = imageSize;\nconst detector_1 = require("./detector");',
      '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.disableTypes = void 0;\nexports.imageSize = imageSize;\nconst detector_1 = require("./detector");\nconst fs_1 = require("fs");'
    );
    applied++;
  }

  // Wrap input: if string, read file; otherwise wrap in Buffer
  if (!content.includes('const buf = Buffer.isBuffer')) {
    content = content.replace(
      "function imageSize(input) {\n    const type = (0, detector_1.detector)(input);",
      "function imageSize(input) {\n    const buf = typeof input === 'string' ? (0, fs_1.readFileSync)(input) : (Buffer.isBuffer(input) ? input : Buffer.from(input));\n    const type = (0, detector_1.detector)(buf);"
    );
    applied++;
  }
  if (content.includes("const size = index_1.typeHandlers.get(type)?.calculate(input);")) {
    content = content.replace(
      "const size = index_1.typeHandlers.get(type)?.calculate(input);",
      "const size = index_1.typeHandlers.get(type)?.calculate(buf);"
    );
    applied++;
  }

  fs.writeFileSync(files.lookup, content, 'utf8');
}

// --- Patch detector.js ---
if (fs.existsSync(files.detector)) {
  let content = fs.readFileSync(files.detector, 'utf8');

  if (!content.includes('const buf = Buffer.isBuffer')) {
    content = content.replace(
      "function detector(input) {\n    const byte = input[0];",
      "function detector(input) {\n    const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);\n    const byte = buf[0];"
    );
    content = content.replace(
      "if (type && index_1.typeHandlers.get(type)?.validate(input)) {",
      "if (type && index_1.typeHandlers.get(type)?.validate(buf)) {"
    );
    content = content.replace(
      "return index_1.types.find((type) => index_1.typeHandlers.get(type)?.validate(input));",
      "return index_1.types.find((type) => index_1.typeHandlers.get(type)?.validate(buf));"
    );
    applied++;
  }

  fs.writeFileSync(files.detector, content, 'utf8');
}

console.log('[patch-image-size] applied ' + applied + ' change(s)');
