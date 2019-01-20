import * as assert from 'assert'
import * as path from 'path'

import * as execa from 'execa'
import * as fse from 'fs-extra'

const testsDir = path.resolve(__dirname, '../../tests')

async function main() {
  process.stdout.write('Format banking CSV file via CLI in place')

  const filePathAbsolute = path.join(testsDir, 'banking/input-latin1.csv')
  const tempPathAbsolute = path.join(testsDir, 'banking/input-latin1.temp.csv')

  const expectedOutput = await fse.readFile(
    path.join(testsDir, 'banking/expected-output.csv'),
    'utf-8',
  )

  await fse.remove(tempPathAbsolute)

  await fse.copy(filePathAbsolute, tempPathAbsolute)

  await execa('./binary/source/cli.js', ['--in-place', tempPathAbsolute])

  const tempContent = await fse.readFile(tempPathAbsolute)

  assert.equal(tempContent, expectedOutput)

  await fse.remove(tempPathAbsolute)

  console.info(' ✔︎')
}

main()
