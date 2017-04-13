const fs = require('fs')
const path = require('path')
const assert = require('assert')
const execute = require('child_process').execFile
const expectedOutput = fs.readFileSync(
  path.join(__dirname, 'banking/expected-output.csv'),
  'utf-8'
)

process.stdout.write('Format banking CSV file')

execute(
  './cli.js',
  ['tests/banking/input-latin1.csv'],
  {cwd: path.join(__dirname, '../')},
  (error, stdout, stderr) => {
    if (stderr) console.error(stderr)
    if (error) throw error

    assert.deepEqual(
      stdout,
      expectedOutput
    )
    console.info(' ✔︎')
  }
)
