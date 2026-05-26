#! /usr/bin/env node

import path from "path"

import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import csvnorm, { MetaInfo } from "./index.js"

const {stdin, stdout, argv} = process

function formatColumnStats(stats: {
  date: number, number: number, currency: number, string: number,
}): string {
  const parts: string[] = []
  if (stats.date) { parts.push(`date=${stats.date}`) }
  if (stats.number) { parts.push(`number=${stats.number}`) }
  if (stats.currency) { parts.push(`currency=${stats.currency}`) }
  if (stats.string) { parts.push(`string=${stats.string}`) }
  return parts.join(", ") || "(empty)"
}

const BOLD = "\x1b[1m"
const RESET = "\x1b[0m"
const RULE = "━".repeat(60)

function printMeta(meta: MetaInfo) {
  const log = console.error
  log("")
  log("")
  log(`${BOLD}${RULE}${RESET}`)
  log(`${BOLD}  Interpretation of Input${RESET}`)
  log(`${BOLD}${RULE}${RESET}`)
  log(`Source:           ${meta.filePath ?? "<stdin>"}`)
  log(`Encoding:         ${meta.encoding ?? "auto-detected"}`)
  log(`Delimiter:        ${JSON.stringify(meta.delimiter)}`)
  log("Delimiter counts:")
  for (const [delim, count] of Object.entries(meta.delimiterHistogram)) {
    log(`  ${JSON.stringify(delim).padEnd(6)} ${count}`)
  }
  log(`Total lines:      ${meta.totalLines}`)
  if (meta.skipLinesStart > 0 || meta.skipLinesEnd > 0) {
    log(
      `Skipped:          ${meta.skipLinesStart} from start, ` +
      `${meta.skipLinesEnd} from end`,
    )
  }
  if (meta.dateFormat) {
    log(`Date format hint: ${meta.dateFormat}`)
  }
  log(`ISO datetime:     ${meta.isoDatetime}`)
  log("Column type counts (across all data rows including header):")
  meta.columnTypes.forEach((stats, idx) => {
    log(`  Column ${idx}: ${formatColumnStats(stats)}`)
  })
}

interface CommandLineOptions {
  "date-format"?: string,
  encoding?: string,
  "in-place"?: boolean,
  "iso-datetime"?: boolean,
  "skip-end"?: number,
  "skip-start"?: number,
  _: string[],
  $0: string,
}

function main(args: string[]) {
  const parser = yargs(args)
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
      "skip-end": {
        default: 0,
        describe: "Skip lines at the end of the input",
        type: "number",
      },

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

      // TODO:
      // 'number-format': {
      //   describe: 'Specify the prioritized number format',
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
  const options = (parser.argv) as unknown as CommandLineOptions


  const onMeta = stdout.isTTY ? printMeta : undefined

  if (options._.length === 0) {
    if (options["in-place"]) {
      console.error("Error: --in-place has no effect with input from stdin")
    }
    if (stdin.isTTY) {
      parser.showHelp()
      return
    }

    csvnorm({
      dateFormat: options["date-format"],
      encoding: options.encoding,
      isoDatetime: options["iso-datetime"],
      readableStream: stdin,
      skipLinesEnd: options["skip-end"],
      skipLinesStart: options["skip-start"],
      writableStream: stdout,
      onMeta,
    })
  }
  else {
    const csvFilePath = options._[0]

    csvnorm({
      dateFormat: options["date-format"],
      encoding: options.encoding,
      filePath: path.resolve(csvFilePath),
      inPlace: options["in-place"],
      isoDatetime: options["iso-datetime"],
      skipLinesEnd: options["skip-end"],
      skipLinesStart: options["skip-start"],
      onMeta,
    })
  }
}

main(hideBin(argv))
