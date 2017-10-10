# Csvnorm

Command line tool to normalize CSV and \*SV files.

Steps:

- Convert to UTF-8 encoding
- Replace separator with `,`
- Reformat
  - Date columns to ISO8601
  - Number columns to `1456.25`
  - Currency columns to `1539.16 $`


## CLI Version

### Installation

```sh
npm install --global csvnorm
```

```sh
yarn global add csvnorm
```


### Usage

```sh
csvnorm data.csv
```

```sh
cat data.csv | csvnorm
```


### TODO

- [ ] Print debugging info in TTY mode



## Node Module

### Installation

```sh
npm install --save csvnorm
```

```sh
yarn add csvnorm
```


### Usage

With files:

```js
const csvnorm = require('csvnorm')

csvnorm({
  filePath: csvFilePath,
  inPlace: true,
})
```


With streams:

```js
const csvnorm = require('csvnorm')

csvnorm({
  readableStream: process.stdin,
  writableStream: process.stdout,
})
```
