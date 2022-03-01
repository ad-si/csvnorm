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
      "label,number",
      "int_0,0",
      "int_1,1",
      "int_medium,12",
      "int_millions,12345678",
      "float_leading_zero,0.12",
      "float_leading_zero_comma,0.12",
      "float,1.23",
      "float_medium,12.34",
      "float_zero,0",
      "float_3_decimal_places,1.234",
      "float_many_decimal_places,135.0075",
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
