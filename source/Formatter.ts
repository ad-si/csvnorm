import stream from "stream"

import formatCurrency from "./formatCurrency.js"
import formatDate from "./formatDate.js"
import formatNumber from "./formatNumber.js"

interface FormatterOptions {
  objectMode?: boolean
  dateFormat?: string
  isoDatetime?: boolean
}

export interface ColumnTypeStats {
  date: number
  number: number
  currency: number
  string: number
}

export default class Formatter extends stream.Transform {
  private dateFormat?: string
  private isoDatetime?: boolean
  public columnTypes: ColumnTypeStats[]

  constructor(opts: FormatterOptions) {
    opts.objectMode = true
    super(opts)
    this.dateFormat = opts.dateFormat
    this.isoDatetime = opts.isoDatetime
    this.columnTypes = []
  }

  public _transform(row: string[], _1: string, chunkIsProcessedCb: () => void) {
    const formattedRow = row
      .map((cell, columnIdx) => {
        if (!this.columnTypes[columnIdx]) {
          this.columnTypes[columnIdx] = {
            date: 0, number: 0, currency: 0, string: 0,
          }
        }
        const stats = this.columnTypes[columnIdx]

        const date = formatDate(cell, this.dateFormat, this.isoDatetime)
        if (date) {
          stats.date++
          return date
        }

        const cellNumber = formatNumber(cell)
        if (cellNumber) {
          stats.number++
          return cellNumber
        }

        const currency = formatCurrency(cell)
        // formatCurrency returns the input unchanged when no currency
        // pattern matches, so compare to detect a real match
        if (currency !== cell) {
          stats.currency++
          return currency
        }

        stats.string++
        return cell
      })

    this.push(formattedRow)
    chunkIsProcessedCb()
  }
}
