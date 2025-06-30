import fs from "fs"
import path from "path"
import readline from "readline"

import { gcsVocabularyBucket } from "../config"
import { IGlobalWord, IGlobalWordSenses, PartOfSpeechEnum } from "../types"
import { logger } from "./logger"

export async function getWordEntryByIndex(lang: string, word: string): Promise<any | null> {
  const normalizedWord = word.trim().toLowerCase()

  const indexPath = path.join(process.cwd(), `src/json_data/dictionaries/${lang}_dictionary.index.json`)
  const indexRaw = await fs.promises.readFile(indexPath, "utf-8")
  const index = JSON.parse(indexRaw) as Record<string, number>

  const offset = index[normalizedWord]
  if (offset === undefined) {
    return null
  }

  const dictPath = `vocabularies-data/${lang}_dictionary.jsonl`

  const stream = gcsVocabularyBucket.file(dictPath).createReadStream({
    start: offset,
    end: offset + 524288,
  })

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  })

  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue

    try {
      const parsed = JSON.parse(trimmed)

      if (typeof parsed.word === "string" && parsed.word.toLowerCase() === normalizedWord) {
        return parsed
      }

      return null
    } catch (err) {
      logger.error(`JSON parse error at offset ${offset}:`, err)
      return null
    }
  }

  return null
}

export function normalizeToGlobalWord(entry: any, target_language: string, native_language: string): Omit<IGlobalWord, "_id" | "created_at" | "updated_at"> {
  const word = entry.word
  const part_of_speech = mapPartOfSpeech(entry.pos)
  const audio = entry.sounds?.find((s: any) => s.mp3_url)?.mp3_url || entry.sounds?.find((s: any) => s.ogg_url)?.ogg_url || null

  let used_fallback = false

  const allSenses = Array.isArray(entry.senses) ? entry.senses : []
  const senses: IGlobalWordSenses[] = allSenses
    .map((sense: any) => {
      const rawTranslations = Array.isArray(sense.translations) ? sense.translations : []

      let filtered = rawTranslations.filter((t: any) => t.code === native_language && typeof t.word === "string")

      if (filtered.length === 0 && target_language !== "en") {
        const fallbackLang = "en"
        filtered = rawTranslations.filter((t: any) => t.code === fallbackLang && typeof t.word === "string")
        if (filtered.length > 0) {
          used_fallback = true
        }
      }

      if (filtered.length === 0) {
        return null
      }

      const translations = filtered.map((t: any) => t.word)
      const definitions = (sense.glosses || []).filter((d: any) => typeof d === "string")
      const examples = (sense.examples || []).filter((e: any) => typeof e.text === "string").map((e: any) => e.text)
      const synonyms = (sense.synonyms || []).filter((s: any) => typeof s.word === "string").map((s: any) => s.word)

      return {
        translations,
        definitions,
        examples,
        synonyms,
      }
    })
    .filter(Boolean)

  return {
    word,
    target_language,
    native_language,
    part_of_speech,
    senses,
    audio_url: audio,
    audio_url_request: null,
    used_fallback,
  }
}

function mapPartOfSpeech(pos: string | undefined): PartOfSpeechEnum | undefined {
  switch (pos) {
    case "noun":
      return PartOfSpeechEnum.noun
    case "pronoun":
      return PartOfSpeechEnum.pronoun
    case "verb":
      return PartOfSpeechEnum.verb
    case "adj":
    case "adjective":
      return PartOfSpeechEnum.adjective
    case "adv":
    case "adverb":
      return PartOfSpeechEnum.adverb
    case "prep":
    case "preposition":
      return PartOfSpeechEnum.preposition
    case "conj":
    case "conjunction":
      return PartOfSpeechEnum.conjunction
    case "interj":
    case "interjection":
      return PartOfSpeechEnum.interjection
    case "article":
      return PartOfSpeechEnum.article
    case "num":
    case "numeral":
      return PartOfSpeechEnum.numeral
    case "particle":
      return PartOfSpeechEnum.particle
    case "det":
    case "determiner":
      return PartOfSpeechEnum.determiner
    default:
      return undefined
  }
}

export function sanitizeWordForFilename(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/[\s\/\\?%*:|"<>#&=]/g, "_")
}
