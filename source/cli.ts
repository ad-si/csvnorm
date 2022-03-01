#! /usr/bin/env node

import path from "path"

import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import csvnorm from "./index.js"

const {stdin, stdout, argv} = process

function logMetaInfos() {
  console.info(
    "=== Following meta infos won't be printed in non tty environments ===",
    "\n",
  )
  console.info("The input was interpreted in following way:", "\n")
}

interface CommandLineOptions {
  "date-format"?: string,
  encoding?: string,
  "in-place"?: boolean,
  "iso-datetime"?: boolean,
  "skip-start"?: number,
  _: string[],
  $0: string,
}

function main(args: string[]) {
  const options = (yargs(args)
    .usage(
      [
        "Usage:",
        "  csvnorm [Options] INFILE [> OUTFILE]",
        "  csvnorm [Options] < INFILE [> OUTFILE]",
      ].join("\n"),
    )
    .options({
      "date-format": {
        describe: "Specify an additional prioritized input date format",
        type: "string",
      },
      "encoding": {
        describe: "Overwrite detected input encoding",
        type: "string",
      },
      "in-place": {
        default: false,
        describe: "Normalize CSV file in place",
        type: "boolean",
      },
      "iso-datetime": {
        default: false,
        describe: "Output datetimes with format YYYY-MM-DD[T]HH:mm:ss.SSS[Z]",
        type: "boolean",
      },
      "skip-start": {
        default: 0,
        describe: "Skip lines at the start of the input",
        type: "number",
      },

      // TODO:
      // 'skip-end': {
      //   default: 0,
      //   describe: 'Skip lines at the end of the input',
      //   type: 'number',
      // },

      // TODO:
      // 'keep-leading-zeros': {
      //   default: true,
      //   describe: 'Parse numbers with leading zeros as strings',
      //   type: 'boolean',
      // },

      // TODO:
      // 'keep-sign-of-number': {
      //   default: true,
      //   describe: 'Keep + and - signs of numbers',
      //   type: 'boolean',
      // },
    })
    .example(
      "csvnorm input.csv > normalized.csv",
      "Normalize a CSV file",
    )
    .example(
      "cat input.csv | csvnorm > normalized.csv",
      "Pipe and normalize a CSV file",
    )
    .example(
      "csvnorm --date-format \"dd/mm/yyyy\" i.csv",
      "Normalize a CSV file with an unusual date format",
    )
    .version()
    .help()
    .argv) as unknown as CommandLineOptions


  if (options._.length === 0) {
    if (options["in-place"]) {
      console.error("Error: --in-place has no effect with input from stdin")
    }
    if (stdin.isTTY) {
      yargs.showHelp()
      return
    }

    if (stdout.isTTY) { logMetaInfos() }

    csvnorm({
      dateFormat: options["date-format"],
      encoding: options.encoding,
      isoDatetime: options["iso-datetime"],
      readableStream: stdin,
      // skipLinesEnd: options['skip-end'],
      skipLinesStart: options["skip-start"],
      writableStream: stdout,
    })
  }
  else {
    const csvFilePath = options._[0]

    if (stdout.isTTY) { logMetaInfos() }

    csvnorm({
      dateFormat: options["date-format"],
      encoding: options.encoding,
      filePath: path.resolve(csvFilePath),
      inPlace: options["in-place"],
      isoDatetime: options["iso-datetime"],
      // skipLinesEnd: options['skip-end'],
      skipLinesStart: options["skip-start"],
    })
  }
}

main(hideBin(argv))
