const fs = require('fs')
const stream = require('stream')

const csvParse = require('csv-parse')
const csvStringify = require('csv-stringify')
const jschardet = require('jschardet')
const iconv = require('iconv-lite')


module.exports = (options = {}) => {
  const {
    readableStream,
    writableStream,
    filePath,
  } = options
  const config = {}
  const delimiterHistogram = {
    ',': 0,
    ';': 0,
    '\t': 0,
    '|': 0,
  }

  class ConfigGenerator extends stream.Writable {
    constructor (opts) {
      super(opts)
    }

    _write (chunk, chunkEncoding, chunkIsProcessedCb) {
      if (!config.encoding) {
        Object.assign(config, jschardet.detect(chunk))
      }

      for (
        let charIndex = 0;
        charIndex < chunk.length;
        charIndex++
      ) {
        const char = chunk.toString()[charIndex]

        if (delimiterHistogram.hasOwnProperty(char)) {
          delimiterHistogram[char]++
        }
      }

      chunkIsProcessedCb()
    }
  }


  function formatDate (value) {
    if (typeof value !== 'string') return null

    const yyyymmdd = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
    if (yyyymmdd.test(value)) return null

    const mmddyyyy = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/
    if (mmddyyyy.test(value)) {
      return value.replace(mmddyyyy, '$3-$1-$2')
    }

    const ddmmyyyy = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/
    if (ddmmyyyy.test(value)) {
      return value.replace(ddmmyyyy, '$3-$2-$1')
    }
  }

  function formatNumber (value) {
    if (typeof value !== 'string') return null

    const containsANumber = /^[0-9+-.,]+$/.test(value)
    if (!containsANumber) return null

    const containsASeparator = /[.,]/.test(value)
    if (!containsASeparator) return Number(value)

    const containsOnlyThousands = /^[0-9]{1,3}(,[0-9]{3})$/.test(value)
    if (containsOnlyThousands) return Number(value.replace(/,/g, ''))

    const separatorChars = value
      .replace(/[^,.]/g, '')
      .split('')

    if ( // thousandSep is `.` and decimal mark is `,`
      separatorChars.shift() === '.' &&
      separatorChars.pop() === ','
    ) {
      return Number(
        value
          .replace('.', '')
          .replace(',', '.')
      )
    }

    const commaAsDecimalMark = /^[0-9+-]+,[0-9]{1,2}$/.test(value)
    if (commaAsDecimalMark) return Number(value.replace(/,(.+?)/, '.$1'))
  }

  function formatCurrency (value) {
    value = value.trim()
    const currencies = /\$|USD|€|EUR/
    const containsACurrency = /^[0-9+-., ]*[$€][0-9+-., ]*$/.test(value)
    if (!containsACurrency) return value

    const match = value.match(currencies)
    if (match) {
      const currency = match[0]
      const formattedNumber = formatNumber(
        value
          .replace(currency, '')
          .trim()
      )
      return `${formattedNumber} ${currency}`
    }
  }

  class Formatter extends stream.Transform {
    constructor (opts = {}) {
      opts.objectMode = true
      super(opts)
    }

    _transform (row, chunkEncoding, chunkIsProcessedCb) {
      const formattedRow = row
        .map(cell => {
          const date = formatDate(cell)
          if (date) return date

          const number = formatNumber(cell)
          if (number) return number

          const currency = formatCurrency(cell)
          if (currency) return currency

          return cell
        })

      this.push(formattedRow)
      chunkIsProcessedCb()
    }
  }

  const configGenerator = new ConfigGenerator()
  const formatter = new Formatter()

  configGenerator.on('finish', () => {
    const mostFrequentDelimter = Array
      .from(Object.entries(delimiterHistogram))
      .sort((itemA, itemB) =>
        itemB[1] - itemA[1]
      )[0][0] // [first entry of delimiter list][key of entry]

    const parser = csvParse({delimiter: mostFrequentDelimter})
    parser.on('error', console.error)

    const stringifier = csvStringify()
    stringifier.on('error', console.error)

    fs
      .createReadStream(filePath)
      .pipe(iconv.decodeStream(config.encoding))
      .pipe(parser)
      .pipe(formatter)
      .pipe(stringifier)
      .pipe(process.stdout)
  })

  if (filePath) {
    fs
      .createReadStream(filePath)
      .pipe(configGenerator)
  }
  else {
    const parser = csvParse()
    const stringifier = csvStringify()

    readableStream
      .pipe(parser)
      .pipe(stringifier)
      .pipe(writableStream)
  }
}
