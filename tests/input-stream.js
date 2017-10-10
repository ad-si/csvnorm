const fs = require('fs')
const path = require('path')
const assert = require('assert')
const {exec} = require('child_process')
const expectedOutput = fs.readFileSync(
  path.join(__dirname, 'banking/expected-output.csv'),
  'utf-8'
)

process.stdout.write('Format banking CSV from stdin via CLI')

exec(
  'cat tests/banking/input-latin1.csv | ./cli.js',
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
