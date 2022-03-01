import assert from 'assert'
import {exec} from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(currentDir, '../..')
const testsDir = path.resolve(rootDir, 'tests')
const expectedOutput = fs.readFileSync(
  path.join(testsDir, 'banking/expected-output.csv'),
  'utf-8',
)
const inputFile = path.join(testsDir, 'banking/input-latin1.csv')
const executable = path.join(rootDir, 'binary/source/cli.js')

process.stdout.write('Format banking CSV from stdin via CLI')

exec(
  `cat ${inputFile} | ${executable}`,
  {cwd: testsDir},
  (error, stdout, stderr) => {
    if (stderr) { console.error(stderr) }
    if (error) { throw error }

    assert.deepEqual(
      stdout,
      expectedOutput,
    )
    console.info(' ✔︎')
  },
)
