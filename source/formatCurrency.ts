import formatNumber from './formatNumber'

export default (value: string) => {
  value = value.trim()
  const currencies = /EUR|€|HUF|SEK|\$|USD/
  const currencyPattern = `^[0-9+-., ]*(${currencies.source})[0-9+-., ]*$`
  const containsACurrency = new RegExp(currencyPattern)
    .test(value)

  if (!containsACurrency) { return value }

  const match = value.match(currencies)

  if (match) {
    const currency = match[0]
    const trimmedValue = value
      .replace(currency, '')
      .trim()

    const formattedNumber = formatNumber(trimmedValue)

    return `${formattedNumber || trimmedValue} ${currency}`
  }
}
