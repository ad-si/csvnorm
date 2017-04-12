# Csvnorm

Command line tool to normalize CSV and *SV files.

Steps:

- Convert to UTF-8 encoding
- Replace separator with `,`
- Reformat
  - (ate columns to ISO8601
  - Number columns to `1456.25`
  - Currency columns to `1539.16 $`
