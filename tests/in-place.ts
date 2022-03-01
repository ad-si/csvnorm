import assert from "assert"
import path from "path"
import { fileURLToPath } from "url"

import { execa } from "execa"
import fse from "fs-extra"

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const testsDir = path.resolve(currentDir, "../../tests")

async function main() {
  process.stdout.write("Format banking CSV file via CLI in place")

  const filePathAbsolute = path.join(testsDir, "banking/input-latin1.csv")
  const tempPathAbsolute = path.join(testsDir, "banking/input-latin1.temp.csv")

  const expectedOutput = await fse.readFile(
    path.join(testsDir, "banking/expected-output.csv"),
    "utf-8",
  )

  await fse.remove(tempPathAbsolute)

  await fse.copy(filePathAbsolute, tempPathAbsolute)

  await execa("./binary/source/cli.js", ["--in-place", tempPathAbsolute])

  const tempContent = await fse.readFile(tempPathAbsolute)

  assert.equal(tempContent, expectedOutput)

  await fse.remove(tempPathAbsolute)

  console.info(" ✔︎")
}

main()
