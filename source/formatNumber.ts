export default function(value: string): string | undefined {

  const isDigitsAndSeparators = /^[0-9+-.,]+$/.test(value)
  if (!isDigitsAndSeparators) { return undefined }

  let optionalSign = ''
  if (value.startsWith('+')) {
    value = value.slice(1)
    optionalSign = '+'
  } else if (value.startsWith('-')) {
    value = value.slice(1)
    optionalSign = '-'
  }

  const hasLeadingZeros = /^0+/.test(value)
  if (!isDigitsAndSeparators || hasLeadingZeros) { return undefined }

  const containsASeparator = /[.,]/.test(value)
  if (!containsASeparator) {
    return optionalSign + String(Number(value))
  }

  const containsOnlyThousands = /^[0-9]{1,3}(,[0-9]{3})$/.test(value)
  if (containsOnlyThousands) {
    return optionalSign + String(Number(value.replace(/,/g, '')))
  }

  const separatorChars = value
    .replace(/[^,.]/g, '')
    .split('')

  if ( // thousandSep is `.` and decimal mark is `,`
    separatorChars.shift() === '.' &&
    separatorChars.pop() === ','
  ) {
    return optionalSign + String(Number(
      value
        .replace('.', '')
        .replace(',', '.'),
    ))
  }

  const commaAsDecimalMark = /^[0-9+-]+,[0-9]{1,2}$/.test(value)
  if (commaAsDecimalMark) {
    return optionalSign + String(Number(value.replace(/,(.+?)/, '.$1')))
  }

  return undefined
}
