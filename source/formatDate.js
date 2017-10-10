module.exports = value => {
  if (typeof value !== 'string') return null

  const mmddyyyy = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/
  if (mmddyyyy.test(value)) {
    console.error()
    return value.replace(mmddyyyy, '$3-$1-$2')
  }

  const ddmmyyyy = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/
  if (ddmmyyyy.test(value)) {
    return value.replace(ddmmyyyy, '$3-$2-$1')
  }

  const ddmmyy = /^([0-3][0-9])\.([01][1-9])\.([0-9]{2})$/
  if (ddmmyy.test(value)) {
    return value.replace(ddmmyy, '20$3-$2-$1')
  }
}
