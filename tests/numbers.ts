import assert from "assert"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import StreamTester from "streamtester"
import csvnorm from "../source/index.js"

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const testsDir = path.resolve(currentDir, "../../tests")
let buffer = Buffer.alloc(0)
const streamTester = new StreamTester({
  test: (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk])
  },
})

streamTester.on("finish", () => {
  const expected = Buffer.from(
    [
      "name,number",
      "john,0",
      "lisa,1",
      "marc,12",
      "carl,0.12",
      "mike,0.12",
      "bob,1.23",
      "anna,12.34",
    ]
      .map((line) => line + "\n")
      .join(""),
  )
  assert.equal(buffer.toString(), expected.toString())
  console.info(" ✔︎")
})

process.stdout.write("Parse CSV file with various number formats")

csvnorm({
  readableStream: fs.createReadStream(
    path.join(testsDir, "numbers.csv"),
  ),
  writableStream: streamTester,
})
