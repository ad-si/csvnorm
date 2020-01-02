#! /usr/bin/env node

import path from 'path'

import yargs from 'yargs'

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
  'date-format'?: string
  encoding?: string
  'in-place': boolean
  // 'skip-end': number
  'skip-start': number
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
      'date-format': {
        describe: 'Overwrite detected date format',
        type: 'string',
      },
      'encoding': {
        describe: 'Overwrite detected input encoding',
        type: 'string',
      },
      'in-place': {
        default: false,
        describe: 'Normalize CSV file in place',
        type: 'boolean',
      },
      'skip-start': {
        default: 0,
        describe: 'Skip lines at the start of the input',
        type: 'number',
      },
      // 'skip-end': {
      //   default: 0,
      //   describe: 'Skip lines at the end of the input',
      //   type: 'number',
      // },
    })
    .example(
      'csvnorm input.csv > normalized.csv',
      'Normalize a CSV file',
    )
    .example(
      'cat input.csv | csvnorm > normalized.csv',
      'Pipe and normalize a CSV file',
    )
    .example(
      'csvnorm --date-format "dd/mm/yyyy" i.csv',
      'Normalize a CSV file with an unusual date format',
    )
    .version()
    .help()
    .parse(args)

  if (options._.length === 0) {
    if (options['in-place']) {
      console.error('Error: --in-place has no effect with input from stdin')
    }
    if (stdin.isTTY) {
      yargs.showHelp()
      return
    }

    if (stdout.isTTY) { logMetaInfos() }

    csvnorm({
      dateFormat: options['date-format'],
      encoding: options.encoding,
      readableStream: stdin,
      // skipLinesEnd: options['skip-end'],
      skipLinesStart: options['skip-start'],
      writableStream: stdout,
    })
  } else {
    const csvFilePath = options._[0]

    if (stdout.isTTY) { logMetaInfos() }

    csvnorm({
      dateFormat: options['date-format'],
      encoding: options.encoding,
      filePath: path.resolve(csvFilePath),
      inPlace: options['in-place'],
      // skipLinesEnd: options['skip-end'],
      skipLinesStart: options['skip-start'],
    })
  }
}

main(argv.slice(2))
