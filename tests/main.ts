import assert from 'assert'
import {execFile} from 'child_process'
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

process.stdout.write('Format banking CSV file via CLI')

execFile(
  path.join(rootDir, 'binary/source/cli.js'),
  [path.join(testsDir, 'banking/input-latin1.csv')],
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
