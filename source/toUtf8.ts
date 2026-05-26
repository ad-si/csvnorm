import stream from "stream"

import chardet from "chardet"
import iconv from "iconv-lite"

interface ToUtf8Options {
  encoding?: string
  sampleSize?: number
}

const UTF_16_HEURISTIC_MIN_RATIO = 0.4
const UTF_16_HEURISTIC_MAX_OPPOSITE = 0.05
const DEFAULT_SAMPLE_SIZE = 64 * 1024

function bytesMatch(buf: Buffer, bytes: number[]): boolean {
  if (buf.length < bytes.length) return false
  for (let i = 0; i < bytes.length; i++) {
    if (buf[i] !== bytes[i]) return false
  }
  return true
}

function isValidUtf8(buf: Buffer): boolean {
  // Tolerate a partial multi-byte sequence at the very end since
  // detection runs on a truncated sample of the input.
  let i = 0
  while (i < buf.length) {
    const byte = buf[i]
    if (byte <= 0x7F) {
      i++
    }
    else if ((byte & 0xE0) === 0xC0) {
      if (byte < 0xC2) return false
      if (i + 1 >= buf.length) return true
      if ((buf[i + 1] & 0xC0) !== 0x80) return false
      i += 2
    }
    else if ((byte & 0xF0) === 0xE0) {
      if (i + 2 >= buf.length) return true
      if ((buf[i + 1] & 0xC0) !== 0x80) return false
      if ((buf[i + 2] & 0xC0) !== 0x80) return false
      if (byte === 0xE0 && buf[i + 1] < 0xA0) return false
      if (byte === 0xED && buf[i + 1] >= 0xA0) return false
      i += 3
    }
    else if ((byte & 0xF8) === 0xF0) {
      if (byte > 0xF4) return false
      if (i + 3 >= buf.length) return true
      if ((buf[i + 1] & 0xC0) !== 0x80) return false
      if ((buf[i + 2] & 0xC0) !== 0x80) return false
      if ((buf[i + 3] & 0xC0) !== 0x80) return false
      if (byte === 0xF0 && buf[i + 1] < 0x90) return false
      if (byte === 0xF4 && buf[i + 1] >= 0x90) return false
      i += 4
    }
    else {
      return false
    }
  }
  return true
}

function detectUtf16(buf: Buffer): "utf-16le" | "utf-16be" | undefined {
  const checkLen = Math.min(buf.length, 4096) & ~1
  if (checkLen < 32) return undefined
  let zeroAtEven = 0
  let zeroAtOdd = 0
  for (let i = 0; i < checkLen; i++) {
    if (buf[i] === 0) {
      if (i % 2 === 0) zeroAtEven++
      else zeroAtOdd++
    }
  }
  const half = checkLen / 2
  if (
    zeroAtOdd / half >= UTF_16_HEURISTIC_MIN_RATIO &&
    zeroAtEven / half <= UTF_16_HEURISTIC_MAX_OPPOSITE
  ) {
    return "utf-16le"
  }
  if (
    zeroAtEven / half >= UTF_16_HEURISTIC_MIN_RATIO &&
    zeroAtOdd / half <= UTF_16_HEURISTIC_MAX_OPPOSITE
  ) {
    return "utf-16be"
  }
  return undefined
}

export function detectEncoding(buf: Buffer): string {
  if (bytesMatch(buf, [0xEF, 0xBB, 0xBF])) return "utf-8"
  if (bytesMatch(buf, [0xFF, 0xFE, 0x00, 0x00])) return "utf-32le"
  if (bytesMatch(buf, [0x00, 0x00, 0xFE, 0xFF])) return "utf-32be"
  if (bytesMatch(buf, [0xFF, 0xFE])) return "utf-16le"
  if (bytesMatch(buf, [0xFE, 0xFF])) return "utf-16be"

  const utf16 = detectUtf16(buf)
  if (utf16) return utf16

  if (isValidUtf8(buf)) return "utf-8"

  const detected = chardet.detect(buf)
  if (detected) {
    const normalized = detected === "ISO-8859-8-I" ? "ISO-8859-8" : detected
    if (iconv.encodingExists(normalized)) return normalized
  }

  return "windows-1252"
}

export default class ToUtf8 extends stream.Transform {
  private encodingHint?: string
  private sampleSize: number
  private sampleBuffer: Buffer[]
  private sampledLength: number
  private decoder?: iconv.DecoderStream
  private detected?: string

  constructor(opts: ToUtf8Options = {}) {
    super()
    this.encodingHint = opts.encoding
    this.sampleSize = opts.sampleSize ?? DEFAULT_SAMPLE_SIZE
    this.sampleBuffer = []
    this.sampledLength = 0

    if (this.encodingHint) {
      this.useEncoding(this.encodingHint)
    }
  }

  public get detectedEncoding(): string | undefined {
    return this.detected
  }

  private useEncoding(encoding: string) {
    const resolved = iconv.encodingExists(encoding) ? encoding : "utf-8"
    this.detected = resolved
    this.decoder = iconv.getDecoder(resolved, {stripBOM: true})
    this.emit("encoding", resolved)
  }

  private flushSample() {
    if (!this.decoder) {
      const sample = Buffer.concat(this.sampleBuffer)
      this.useEncoding(detectEncoding(sample))
      const decoded = this.decoder!.write(sample)
      if (decoded) this.push(decoded)
    }
    this.sampleBuffer = []
    this.sampledLength = 0
  }

  public _transform(
    chunk: Buffer,
    _enc: string,
    cb: (err?: Error | null) => void,
  ) {
    try {
      if (this.decoder && this.sampleBuffer.length === 0) {
        const decoded = this.decoder.write(chunk)
        if (decoded) this.push(decoded)
        return cb()
      }

      this.sampleBuffer.push(chunk)
      this.sampledLength += chunk.length

      if (this.sampledLength >= this.sampleSize) {
        this.flushSample()
      }
      cb()
    }
    catch (err) {
      cb(err as Error)
    }
  }

  public _flush(cb: (err?: Error | null) => void) {
    try {
      if (this.sampleBuffer.length > 0) {
        this.flushSample()
      }
      if (this.decoder) {
        const tail = this.decoder.end()
        if (tail) this.push(tail)
      }
      cb()
    }
    catch (err) {
      cb(err as Error)
    }
  }
}
