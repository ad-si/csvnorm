const path = require('path')
const assert = require('assert')

const fse = require('fs-extra')
const execa = require('execa')


async function main () {
  process.stdout.write('Format banking CSV file via CLI in place')

  const filePathAbsolute = path.join(__dirname, 'banking/input-latin1.csv')
  const tempPathAbsolute = path.join(__dirname, 'banking/input-latin1.temp.csv')

  const expectedOutput = await fse.readFile(
    path.join(__dirname, 'banking/expected-output.csv'),
    'utf-8'
  )

  await fse.remove(tempPathAbsolute)

  await fse.copy(filePathAbsolute, tempPathAbsolute)

  await execa('./cli.js', ['--in-place', tempPathAbsolute])

  const tempContent = await fse.readFile(tempPathAbsolute)

  assert.equal(tempContent, expectedOutput)

  console.info(' ✔︎')
}

main()
