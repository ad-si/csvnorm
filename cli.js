#! /usr/bin/env node

const path = require('path')
const csvnorm = require('.')
const csvFilePath = process.argv[2]

if (csvFilePath) {
  csvnorm({filePath: path.resolve(csvFilePath)})
}
else {
  csvnorm({
    readableStream: process.stdin,
    writableStream: process.stdout,
  })
}
