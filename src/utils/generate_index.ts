import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

export async function buildIndexForLang(lang: string): Promise<void> {
  const filePath = path.join(process.cwd(), `src/json_data/dictionaries/${lang}_dictionary.jsonl`)
  const indexPath = path.join(process.cwd(), `src/json_data/dictionaries/${lang}_dictionary.index.json`)

  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  const indexStream = fs.createWriteStream(indexPath, { flags: "w" })

  indexStream.write("{\n")

  const seen = new Set<string>()
  let byteOffset = 0
  let lineCount = 0
  let indexedCount = 0
  let lastRecord = ""

  for await (const line of rl) {
    lineCount++
    if (!line.trim()) continue

    try {
      const parsed = JSON.parse(line)
      const word = parsed.word
      if (typeof word === "string") {
        const normalized = word.toLowerCase()
        if (!seen.has(normalized)) {
          seen.add(normalized)

          const safeKey = JSON.stringify(normalized)
          const record = `${safeKey}:${byteOffset}`

          if (lastRecord) indexStream.write(lastRecord + ",")
          lastRecord = record

          indexedCount++
        }
      }
    } catch (err) {
      console.error(`Error at line ${lineCount}:`, err)
    }

    byteOffset += Buffer.byteLength(line, "utf-8") + 1

    if (lineCount % 100_000 === 0) {
      console.log(`Processed: ${lineCount} | Indexed: ${indexedCount}`)
    }
  }

  if (lastRecord) indexStream.write(lastRecord + "\n")
  indexStream.write("}\n")
  indexStream.end()

  console.log(`Finished. Indexed: ${indexedCount} words. Output: ${indexPath}`)
}

buildIndexForLang("en")

// export async function validateJsonFile(filePath: string): Promise<void> {
//   let content = ""
//   try {
//     content = await fs.promises.readFile(filePath, "utf-8")
//     JSON.parse(content)
//     console.log("JSON valid:", filePath)
//   } catch (error: any) {
//     console.error("JSON invalid:", filePath)
//     console.error("Message:", error.message)
//     const posMatch = error.message.match(/at position (\d+)/)
//     if (posMatch) {
//       const pos = parseInt(posMatch[1], 10)
//       console.error("Approx position:", pos)
//       const snippet = content.slice(pos - 50, pos + 50)
//       console.error("Snippet:\n...\n" + snippet + "\n...")
//     }
//   }
// }

// const file = path.join(process.cwd(), "src/json_data/dictionaries/en_dictionary.index.json")
// validateJsonFile(file)
