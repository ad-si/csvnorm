#! /usr/bin/env node

import * as path from 'path'

import * as yargs from 'yargs'

import csvnorm from './index'

const {stdin, stdout, argv} = process

function logMetaInfos() {
  console.info(
    '=== Following meta infos won\'t be printed in non tty environments ===',
    '\n',
  )
  console.info('The input was interpreted in following way:', '\n')
}

interface CommandLineOptions {
  [x: string]: unknown
  'in-place': boolean
  _: string[]
  $0: string
}

function main(args: string[]) {
  const options: CommandLineOptions = yargs
    .usage(
      [
        'Usage:',
        '  csvnorm [Options] INFILE [> OUTFILE]',
        '  csvnorm [Options] < INFILE [> OUTFILE]',
      ].join('\n'),
    )
    .options({
      'in-place': {
        default: false,
        describe: 'Normalize CSV file in place',
        type: 'boolean',
      },
    })
    .example(
      'csvnorm input.csv > normalized.csv',
      'Normalize a CSV file',
    )
    .example(
      'cat input.csv | csvnorm > normalized.csv',
      'Pipe and normalize a CSV file',
    )
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

    if (stdout.isTTY) { logMetaInfos() }

    csvnorm({
      readableStream: stdin,
      writableStream: stdout,
    })
  } else {
    const csvFilePath = options._[0]

    if (stdout.isTTY) { logMetaInfos() }

    csvnorm({
      filePath: path.resolve(csvFilePath),
      inPlace: options['in-place'],
    })
  }
}

main(argv.slice(2))
