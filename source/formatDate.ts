const formatToPattern = new Map([
  ['mm/dd/yyyy', {
    regex: /^([01][0-9])\/([0-3][0-9])\/([0-9]{4})$/,
    replacement: '$3-$1-$2',
  }],
  ['mm/dd/yy', {
    regex: /^([01][0-9])\/([0-3][0-9])\/([0-9]{2})$/,
    replacement: '20$3-$1-$2',
  }],
  ['dd.mm.yyyy', {
    regex: /^([0-3][0-9])\.([01][0-9])\.([0-9]{4})$/,
    replacement: '$3-$2-$1',
  }],
  ['dd.mm.yy', {
    regex: /^([0-3][0-9])\.([01][0-9])\.([0-9]{2})$/,
    replacement: '20$3-$2-$1',
  }],
  ['dd/mm/yyyy', {
    regex: /^([0-3][0-9])\/([01][0-9])\/([0-9]{4})$/,
    replacement: '$3-$2-$1',
  }],
  ['dd/mm/yy', {
    regex: /^([0-3][0-9])\/([01][0-9])\/([0-9]{2})$/,
    replacement: '20$3-$2-$1',
  }],
])

export default (
  value: string,
  dateFormat?: string,
  isoDatetime = false,
): string | undefined => {
  if (typeof value !== 'string') { return undefined }

  const emptyPattern = {regex: / /, replacement: ''}
  let pattern

  if (dateFormat) {
    if (!formatToPattern.has(dateFormat)) {
      throw new Error('The specified date format is not yet supported')
    }
    pattern = formatToPattern.get(dateFormat) || emptyPattern

    if (pattern.regex.test(value)) {
      return value.replace(pattern.regex, pattern.replacement)
    }
  }

  pattern = formatToPattern.get('mm/dd/yyyy') || emptyPattern
  if (pattern.regex.test(value)) {
    return value.replace(pattern.regex, pattern.replacement)
  }

  pattern = formatToPattern.get('dd.mm.yyyy') || emptyPattern
  if (pattern.regex.test(value)) {
    return value.replace(pattern.regex, pattern.replacement)
  }

  pattern = formatToPattern.get('dd.mm.yy') || emptyPattern
  if (pattern.regex.test(value)) {
    return value.replace(pattern.regex, pattern.replacement)
  }

  if (isoDatetime) {
    const isoRegex = new RegExp(
      [
        /^([0-9]{4})-([01][0-9])-([0-3][0-9])/,
        /[ t]/,
        /[0-2][0-9]:[0-5][0-9](:[0-5][0-9])?/,
        /(.[0-9]{3})?(|z|\+[0-9][0-9]:?[0-9][0-9])$/,
      ]
        .map((regex) => regex.source)
        .join(''),
      'i',
    )

    if (isoRegex.test(value)) {
      const parsedDate = new Date(value)

      if (parsedDate) {
        return parsedDate.toISOString()
      }
    }
  }

  return undefined
}
