import stream from 'stream'

import formatCurrency from './formatCurrency'
import formatDate from './formatDate'
import formatNumber from './formatNumber'

interface FormatterOptions {
  objectMode?: boolean
  dateFormat?: string
}

export default class Formatter extends stream.Transform {
  private dateFormat?: string

  constructor(opts: FormatterOptions) {
    opts.objectMode = true
    super(opts)
    this.dateFormat = opts.dateFormat
  }

  public _transform(row: string[], _1: string, chunkIsProcessedCb: () => void) {
    const formattedRow = row
      .map((cell) => {
        const date = formatDate(cell, this.dateFormat)
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
