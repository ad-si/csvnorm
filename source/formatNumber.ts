export default function(value: string): string | undefined {

  const isDigitsAndSeparators = /^[0-9+-.,]+$/.test(value)
  if (!isDigitsAndSeparators) { return undefined }

  let optionalSign = ""
  if (value.startsWith("+")) {
    value = value.slice(1)
    optionalSign = "+"
  } else if (value.startsWith("-")) {
    value = value.slice(1)
    optionalSign = "-"
  }

  const hasLeadingZeros = /^0+/.test(value)
  const isZeroComma = /^0,/.test(value)
  if (!isDigitsAndSeparators || (hasLeadingZeros && !isZeroComma)) {
    return undefined
  }

  const containsASeparator = /[.,]/.test(value)
  if (!containsASeparator) {
    const num = Number(value)
    return Number.isNaN(num)
      ? undefined
      : optionalSign + String(num)
  }

  const containsOnlyThousands = /^[0-9]{1,3}(,[0-9]{3})$/.test(value)
  if (containsOnlyThousands) {
    const num = Number(value.replace(/,/g, ""))
    return Number.isNaN(num)
      ? undefined
      : optionalSign + String(num)
  }

  const separatorChars = value
    .replace(/[^,.]/g, "")
    .split("")

  if ( // thousandSep is `.` and decimal mark is `,`
    separatorChars.shift() === "." &&
    separatorChars.pop() === ","
  ) {
    const num = Number(
      value
        .replace(".", "")
        .replace(",", "."),
    )
    return Number.isNaN(num)
      ? undefined
      : optionalSign + String(num)
  }

  const commaAsDecimalMark = /^[0-9+-]+,[0-9]{1,2}$/.test(value)
  if (commaAsDecimalMark) {
    const num = Number(value.replace(/,(.+?)/, ".$1"))
    return Number.isNaN(num)
      ? undefined
      : optionalSign + String(num)
  }

  return undefined
}
