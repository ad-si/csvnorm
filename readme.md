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

```txt
Usage:
  csvnorm [Options] INFILE [> OUTFILE]
  csvnorm [Options] < INFILE [> OUTFILE]

Options:
  --date-format   Specify an additional prioritized input date format   [string]
  --encoding      Overwrite detected input encoding                     [string]
  --in-place      Normalize CSV file in place         [boolean] [default: false]
  --iso-datetime  Output datetimes with format YYYY-MM-DD[T]HH:mm:ss.SSS[Z]
                                                      [boolean] [default: false]
  --skip-start    Skip lines at the start of the input     [number] [default: 0]
  --version       Show version number                                  [boolean]
  --help          Show help                                            [boolean]

Examples:
  csvnorm input.csv > normalized.csv        Normalize a CSV file
  cat input.csv | csvnorm > normalized.csv  Pipe and normalize a CSV file
  csvnorm --date-format "dd/mm/yyyy" i.csv  Normalize a CSV file with an unusual
                                            date format
```


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

**Warning:**
Numbers from `1,000` to `999,999` with 3 decimal places
are parsed as floats (`1.000` to `999.999`).
Only numbers larger than `1,000,000`
or numbers with less or more than 3 decimal places
can be unambiguously parsed as integers (`1000000`).


### TODO

- [ ] Print debugging info in TTY mode
- [ ] Improve encoding detection
      (e.g. fork and update https://github.com/finnp/to-utf-8)
- [ ] Implement `skipLinesEnd`
