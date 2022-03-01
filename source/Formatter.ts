import stream from "stream"

import formatCurrency from "./formatCurrency.js"
import formatDate from "./formatDate.js"
import formatNumber from "./formatNumber.js"

interface FormatterOptions {
  objectMode?: boolean
  dateFormat?: string
  isoDatetime?: boolean
}

export default class Formatter extends stream.Transform {
  private dateFormat?: string
  private isoDatetime?: boolean

  constructor(opts: FormatterOptions) {
    opts.objectMode = true
    super(opts)
    this.dateFormat = opts.dateFormat
    this.isoDatetime = opts.isoDatetime
  }

  public _transform(row: string[], _1: string, chunkIsProcessedCb: () => void) {
    const formattedRow = row
      .map((cell) => {
        const date = formatDate(cell, this.dateFormat, this.isoDatetime)
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
