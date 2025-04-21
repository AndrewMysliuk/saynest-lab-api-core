import { Readable } from "stream"

// ElevenLabs TTS Helper
export async function* normalizeAudioStream(stream: Readable, minChunkSize: number = 2048, flushTimeoutMs: number = 100): AsyncGenerator<Buffer> {
  let buffer = Buffer.alloc(0)
  let timeout: NodeJS.Timeout | null = null
  let flushResolver: (() => void) | null = null

  const waitFlush = () =>
    new Promise<void>((resolve) => {
      flushResolver = resolve
      timeout = setTimeout(() => {
        if (flushResolver) flushResolver()
        timeout = null
        flushResolver = null
      }, flushTimeoutMs)
    })

  for await (const chunk of stream) {
    if (!chunk || !(chunk instanceof Buffer)) continue

    buffer = Buffer.concat([buffer, chunk])

    if (buffer.length >= minChunkSize) {
      yield buffer
      buffer = Buffer.alloc(0)

      if (timeout) {
        clearTimeout(timeout)
        timeout = null
        flushResolver = null
      }
    } else {
      if (!timeout) await waitFlush()
      if (buffer.length > 0) {
        yield buffer
        buffer = Buffer.alloc(0)
      }
    }
  }

  if (timeout) clearTimeout(timeout)
  if (buffer.length > 0) yield buffer
}
