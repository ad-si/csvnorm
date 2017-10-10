#! /usr/bin/env node

const path = require('path')

const yargs = require('yargs')
const csvnorm = require('./source')
const {stdin, stdout, argv} = process

function logMetaInfos () {
  console.info(
    '=== Following meta infos won\'t be printed in non tty environments ===',
    '\n'
  )
  console.info('The input was interpreted in following way:', '\n')
}

function main (args) {
  const options = yargs
    .usage(
      [
        'Usage:',
        '  csvnorm [Options] INFILE [> OUTFILE]',
        '  csvnorm [Options] < INFILE [> OUTFILE]',
      ].join('\n')
    )
    .options({
      'in-place': {
        describe: 'Normalize CSV file in place',
        type: 'boolean',
        default: false,
      },
    })
    .example('csvnorm input.csv > normalized.csv')
    .example('cat input.csv | csvnorm > normalized.csv')
    .version()
    .help()
    .parse(args)

  if (options._.length === 0) {
    if (options.inPlace) {
      console.error('Error: --in-place has no effect with input from stdin')
    }
    if (stdin.isTTY) {
      yargs.showHelp()
      return
    }

    if (stdout.isTTY) logMetaInfos()

    csvnorm({
      readableStream: stdin,
      writableStream: stdout,
    })
  }
  else {
    const csvFilePath = options._[0]

    if (stdout.isTTY) logMetaInfos()

    csvnorm({
      filePath: path.resolve(csvFilePath),
      inPlace: options.inPlace,
    })
    return
  }
}

main(argv.slice(2))
