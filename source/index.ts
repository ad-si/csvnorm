import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import * as stream from 'stream'

import * as csvParse from 'csv-parse'
import * as csvStringify from 'csv-stringify'
import * as tempfile from 'tempfile'
import * as toUtf8 from 'to-utf-8'

import Formatter from './Formatter'

interface ConfigGeneratorInterface {
  delimiterHistogram: {[delimiter: string]: number}
  mostFrequentDelimter: string
}

interface PrintCsvArgs {
  configGenerator: ConfigGeneratorInterface,
  inputFilePath: string,
  writableStream?: stream,
}

function printCsv(options: PrintCsvArgs) {
  const {
    configGenerator,
    inputFilePath,
    writableStream,
  } = options

  const formatter = new Formatter({})
  const parser = csvParse({
    delimiter: configGenerator.mostFrequentDelimter,
  })
  parser.on('error', console.error)

  const stringifier = csvStringify()
  stringifier.on('error', console.error)

  fs
    .createReadStream(inputFilePath)
    .pipe(toUtf8())
    .pipe(parser)
    .pipe(formatter)
    .pipe(stringifier)
    .pipe(writableStream || process.stdout)
}

interface MainOptions {
  filePath?: string
  inPlace?: boolean
  readableStream?: stream
  writableStream?: stream
}

export default (options: MainOptions) => {
  const {
    filePath,
    inPlace,
    readableStream,
  } = options
  let {writableStream} = options

  class ConfigGenerator extends stream.Writable implements ConfigGeneratorInterface {
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

    public _write(chunk: string, chunkEncoding: string, chunkIsProcessedCb: () => void) {
      for (
        let charIndex = 0;
        charIndex < chunk.length;
        charIndex++
      ) {
        const char = chunk.toString()[charIndex]

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
        inputFilePath: filePath,
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
      inputFilePath: temporaryFilePath,
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
