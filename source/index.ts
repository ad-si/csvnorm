import assert from 'assert'
import fs from 'fs'
import path from 'path'
import stream from 'stream'

import csvParse from 'csv-parse'
import csvStringify from 'csv-stringify'
import tempfile from 'tempfile'
import toUtf8 from 'to-utf-8'

import Formatter from './Formatter'

interface ConfigGeneratorInterface {
  delimiterHistogram: {[delimiter: string]: number}
  mostFrequentDelimter: string
}

interface PrintCsvArgs {
  configGenerator: ConfigGeneratorInterface
  dateFormat?: string
  encoding?: string
  inputFilePath: string
  isoDatetime: boolean
  // skipLinesEnd: number
  skipLinesStart: number
  writableStream?: stream
}

interface MainOptions {
  dateFormat?: string
  encoding?: string
  filePath?: string
  inPlace?: boolean
  isoDatetime?: boolean
  readableStream?: stream
  // skipLinesEnd?: number
  skipLinesStart?: number
  writableStream?: stream
}

function printCsv(options: PrintCsvArgs) {
  const {
    configGenerator,
    dateFormat,
    encoding,
    isoDatetime,
    skipLinesStart = 0,
    // skipLinesEnd = 0,
    inputFilePath,
    writableStream,
  } = options

  const formatter = new Formatter({dateFormat, isoDatetime})
  const parser = csvParse({
    delimiter: configGenerator.mostFrequentDelimter,
    from_line: skipLinesStart + 1,
    // TODO:
    // to_line: numberOfLines - skipLinesEnd,
  })
  parser.on('error', console.error)

  const stringifier = csvStringify({
    cast: {
      date: (date: Date) => {
        console.error(date)
        return date
      },
    },
  } as any)
  stringifier.on('error', console.error)

  fs
    .createReadStream(inputFilePath)
    .pipe(toUtf8({encoding}))
    .pipe(parser)
    .pipe(formatter)
    .pipe(stringifier)
    .pipe(writableStream || process.stdout)
}

class ConfigGenerator extends stream.Writable
  implements ConfigGeneratorInterface {

  public delimiterHistogram: {[delimiter: string]: number}
  public mostFrequentDelimter: string

  constructor(opts: object) {
    super(opts)
    this.delimiterHistogram = {
      '\t': 0,
      ',': 0,
      ';': 0,
      '|': 0,
    }
    this.mostFrequentDelimter = ','
  }

  public _write(chunk: Buffer, _1: string, chunkIsProcessedCb: () => void) {
    for (const char of chunk.toString()) {
      if (this.delimiterHistogram.hasOwnProperty(char)) {
        this.delimiterHistogram[char]++
      }
    }

    chunkIsProcessedCb()
  }

  public _final(done: () => void) {
    const pairs: Array<[string, number]> = Array
      .from(Object.entries(this.delimiterHistogram))
      .sort((itemA, itemB) =>
        itemB[1] - itemA[1],
      )
    // [first entry of delimiter list][key of entry]
    this.mostFrequentDelimter = pairs[0][0]
    done()
  }
}

export default (options: MainOptions) => {
  const {
    dateFormat,
    encoding,
    filePath,
    inPlace,
    isoDatetime = false,
    readableStream,
    // skipLinesEnd = 0,
    skipLinesStart = 0,
  } = options
  let {writableStream} = options

  const configGenerator = new ConfigGenerator({})

  if (filePath) {
    assert(path.isAbsolute(filePath))

    fs
      .createReadStream(filePath)
      .pipe(configGenerator)

    if (inPlace) {
      const tempFilePath = tempfile('.csv')
      writableStream = fs.createWriteStream(tempFilePath)
      writableStream.on('finish', () => {
        fs.rename(tempFilePath, filePath, console.error)
      })
    }

    configGenerator.on('finish', () => {
      printCsv({
        configGenerator,
        dateFormat,
        encoding,
        inputFilePath: filePath,
        isoDatetime,
        // skipLinesEnd,
        skipLinesStart,
        writableStream,
      })
    })
    return
  }

  const temporaryFilePath = tempfile('.csv')
  const writableTempFile = fs.createWriteStream(temporaryFilePath)
  let firstStreamFinished = false

  function syncStreams() {
    if (!firstStreamFinished) {
      firstStreamFinished = true
      return
    }

    printCsv({
      configGenerator,
      dateFormat,
      encoding,
      inputFilePath: temporaryFilePath,
      isoDatetime,
      // skipLinesEnd,
      skipLinesStart,
      writableStream,
    })
  }

  configGenerator.on('finish', syncStreams)
  if (readableStream) {
    readableStream.pipe(configGenerator)
  }

  writableTempFile.on('finish', syncStreams)
  if (readableStream) {
    readableStream.pipe(writableTempFile)
  }
}
