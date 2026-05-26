# Csvnorm

Command line tool to normalize CSV and \*SV files.

Steps:

- Convert to UTF-8 encoding
- Replace separator with `,`
- Reformat
  - Date columns to ISO8601
  - Number columns to `1456.25`
  - Currency columns to `1539.16 $`


## Encoding Detection

The input encoding is detected in this order:

1. **Byte Order Mark (BOM)** —
    UTF-8, UTF-16 LE/BE, and UTF-32 LE/BE BOMs are recognized
    and stripped from the output.
2. **UTF-16 heuristic** —
    Files without a BOM are identified by the alternating zero-byte pattern
    of ASCII text encoded as UTF-16 LE or BE.
3. **Strict UTF-8 validation** —
    The byte stream is checked against the UTF-8 grammar
    (rejecting overlong sequences and surrogate halves).
4. **[chardet](https://github.com/runk/node-chardet) fallback** —
    Used to discriminate between single-byte encodings
    such as ISO-8859-x and windows-125x.
5. **windows-1252** as the last resort
    if every previous step is inconclusive.

The detected encoding is shown in the interpretation summary
when the output is a terminal,
and can be overridden via `--encoding`.


## CLI Version

### Installation

```sh
npm install --global csvnorm
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
  --skip-end      Skip lines at the end of the input       [number] [default: 0]
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

`csvnorm` is an ES module and requires Node.js 20 or later.


### Usage

With files:

```js
import csvnorm from "csvnorm"

csvnorm({
  filePath: csvFilePath,
  inPlace: true,
})
```


With streams:

```js
import csvnorm from "csvnorm"

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
