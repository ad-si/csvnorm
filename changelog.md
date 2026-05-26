# Changelog

## 2026-05-26 - 1.2.0

- Add `--skip-end` option to skip lines at the end of the input.
- Improve encoding detection: BOM-aware, strict UTF-8 validation,
  UTF-16 heuristic without BOM, fallback to `chardet`.
  Replaces the unmaintained `to-utf-8` module.
- Surface the auto-detected encoding in the interpretation summary.
- Convert package to ESM (`"type": "module"`).
- Upgrade dependencies (TypeScript 6, ESLint 10, yargs 18, csv-parse 6,
  csv-stringify 6, execa 9, fs-extra 11, tempy 3, Node types 25).
- Migrate ESLint config from `.eslintrc.cjs` to flat `eslint.config.js`.
- Add Nix flake for reproducible development environment (Node.js 24).

## 2022-03-01 - 1.1.0

- Prioritize comma as decimal separator in ambiguous formats.

## 2022-03-01 - 1.0.0

- Switch code style from single to double quotes.
- Fix incorrect normalization of numbers starting with `0,`.

## 2020-10-26 - 0.10.0

- Switch from TSLint to ESLint, upgrade dependencies.
- Migrate from yarn to npm.
- Make sure parsed numbers are not `NaN` before returning.

## 2020-01-18 - 0.9.1

- Fix normalization when date is already formatted as ISO8601.

## 2020-01-18 - 0.9.0

- Don't change formatting of numbers starting with `0`, `+`, or `-`.

## 2020-01-02 - 0.8.0

- Add `--iso-datetime` option to output datetimes as
  `YYYY-MM-DD[T]HH:mm:ss.SSS[Z]`.

## 2019-12-08 - 0.7.0

- Add `--date-format` option to specify additional input date formats.

## 2019-01-20 - 0.6.0

- Add `--skip-start` option to skip lines at the start of the input.

## 2019-01-08 - 0.5.0

- Rewrite project in TypeScript.
- Switch encoding detection to the `to-utf-8` module (adds UTF-16 LE support).

## 2017-10-20 - 0.4.3

- Fix in-place normalization.

## 2017-10-10 - 0.4.2

- Fix wrong `main` path in `package.json`.

## 2017-10-10 - 0.4.1

- Fix incorrect date regex.
- Modularize code.

## 2017-07-03 - 0.4.0

- Add `--in-place` flag to normalize a CSV file in place.

## 2017-06-28 - 0.3.1

- Add missing `package.json` file entries.

## 2017-06-28 - 0.3.0

- Handle TTY and non-TTY environments in CLI.
- Fix normalization of input from stdin.

## 2017-04-13 - 0.2.0

- Format numbers, dates and currencies.
- Add more currencies.

## 2017-04-12 - 0.1.0

- Initial implementation.
