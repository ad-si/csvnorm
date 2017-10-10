const stream = require('stream')

const formatCurrency = require('./formatCurrency')
const formatDate = require('./formatDate')
const formatNumber = require('./formatNumber')

module.exports = class Formatter extends stream.Transform {
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
