import assert from "assert"
import iconv from "iconv-lite"

import { detectEncoding } from "../source/toUtf8.js"
import ToUtf8 from "../source/toUtf8.js"

const cases: Array<{name: string, bytes: Buffer, expected: string}> = [
  {
    name: "UTF-8 BOM",
    bytes: Buffer.concat([
      Buffer.from([0xEF, 0xBB, 0xBF]),
      Buffer.from("name,age\nAlice,30\n", "utf-8"),
    ]),
    expected: "utf-8",
  },
  {
    name: "UTF-16-LE BOM",
    bytes: Buffer.concat([
      Buffer.from([0xFF, 0xFE]),
      iconv.encode("name,age\nAlice,30\n", "utf-16le"),
    ]),
    expected: "utf-16le",
  },
  {
    name: "UTF-16-BE BOM",
    bytes: Buffer.concat([
      Buffer.from([0xFE, 0xFF]),
      iconv.encode("name,age\nAlice,30\n", "utf-16be"),
    ]),
    expected: "utf-16be",
  },
  {
    name: "UTF-16-LE without BOM (heuristic)",
    bytes: iconv.encode(
      "name,age\nAlice,30\nBob,25\nCarol,42\nDan,19\n",
      "utf-16le",
    ),
    expected: "utf-16le",
  },
  {
    name: "UTF-16-BE without BOM (heuristic)",
    bytes: iconv.encode(
      "name,age\nAlice,30\nBob,25\nCarol,42\nDan,19\n",
      "utf-16be",
    ),
    expected: "utf-16be",
  },
  {
    name: "plain UTF-8 (no BOM, with non-ASCII)",
    bytes: Buffer.from("name,city\nMüller,Köln\n", "utf-8"),
    expected: "utf-8",
  },
  {
    name: "pure ASCII",
    bytes: Buffer.from("name,age\nAlice,30\n", "utf-8"),
    expected: "utf-8",
  },
]

process.stdout.write("Detect encoding from byte samples")
for (const c of cases) {
  const got = detectEncoding(c.bytes).toLowerCase()
  assert.strictEqual(
    got,
    c.expected.toLowerCase(),
    `${c.name}: expected ${c.expected}, got ${got}`,
  )
}
console.info(" ✔︎")

process.stdout.write("Decode Latin-1 stream via ToUtf8 transform")
{
  const latin1Source = Buffer.from(
    [0x4e, 0x61, 0x6d, 0x65, 0x2c, 0x43, 0x69, 0x74,
      0x79, 0x0a, 0x4d, 0xfc, 0x6c, 0x6c, 0x65, 0x72,
      0x2c, 0x4b, 0xf6, 0x6c, 0x6e, 0x0a],
  )
  const decoder = new ToUtf8()
  const chunks: Buffer[] = []
  decoder.on("data", (d: Buffer) => chunks.push(d))
  decoder.on("end", () => {
    const out = Buffer.concat(chunks).toString("utf-8")
    assert.strictEqual(out, "Name,City\nMüller,Köln\n")
    assert.strictEqual(
      (decoder.detectedEncoding ?? "").toLowerCase().startsWith("iso-8859") ||
        (decoder.detectedEncoding ?? "")
          .toLowerCase()
          .startsWith("windows-125"),
      true,
      `expected single-byte encoding, got ${decoder.detectedEncoding}`,
    )
    console.info(" ✔︎")
  })
  decoder.end(latin1Source)
}
