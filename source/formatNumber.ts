export default (value: string) => {
  if (typeof value !== 'string') { return null }

  const containsANumber = /^[0-9+-.,]+$/.test(value)
  if (!containsANumber) { return null }

  const containsASeparator = /[.,]/.test(value)
  if (!containsASeparator) { return Number(value) }

  const containsOnlyThousands = /^[0-9]{1,3}(,[0-9]{3})$/.test(value)
  if (containsOnlyThousands) { return Number(value.replace(/,/g, '')) }

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
        .replace(',', '.'),
    )
  }

  const commaAsDecimalMark = /^[0-9+-]+,[0-9]{1,2}$/.test(value)
  if (commaAsDecimalMark) { return Number(value.replace(/,(.+?)/, '.$1')) }
}
