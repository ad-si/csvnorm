import * as stream from 'stream'

import formatCurrency from './formatCurrency'
import formatDate from './formatDate'
import formatNumber from './formatNumber'

interface FormatterOptions {
  objectMode?: boolean
}

export default class Formatter extends stream.Transform {
  constructor(opts: FormatterOptions) {
    opts.objectMode = true
    super(opts)
  }

  public _transform(row: string[], chunkEncoding: string, chunkIsProcessedCb: () => void) {
    const formattedRow = row
      .map((cell) => {
        const date = formatDate(cell)
        if (date) { return date }

        const cellNumber = formatNumber(cell)
        if (cellNumber) { return cellNumber }

        const currency = formatCurrency(cell)
        if (currency) { return currency }

        return cell
      })

    this.push(formattedRow)
    chunkIsProcessedCb()
  }
}
