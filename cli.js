#! /usr/bin/env node

const path = require('path')
const csvnorm = require('.')
const {stdin, stdout, argv} = process

function logMetaInfos () {
  console.info(
    '=== Following meta infos won\'t be printed in non tty environments ===',
    '\n'
  )
  console.info('The input was interpreted in following way:', '\n')
}

function main (args) {
  const csvFilePath = args[0]

  if (csvFilePath) {
    if (stdout.isTTY) logMetaInfos()

    csvnorm({filePath: path.resolve(csvFilePath)})
    return
  }

  if (stdin.isTTY) {
    console.info('Usage: csvnorm $input_file > $output_path')
    return
  }

  if (stdout.isTTY) logMetaInfos()

  csvnorm({
    readableStream: stdin,
    writableStream: stdout,
  })
}

main(argv.slice(2))
