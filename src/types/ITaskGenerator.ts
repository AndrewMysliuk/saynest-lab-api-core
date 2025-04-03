import { IGPTPayload } from "./IGPT"
import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export enum TaskTypeEnum {
  FILL_BLANK = "FILL_BLANK",
  MATCH_TRANSLATION = "MATCH_TRANSLATION",
  REORDER_WORDS = "REORDER_WORDS",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  CORRECT_SENTENCE = "CORRECT_SENTENCE",
  LISTEN_AND_TYPE = "LISTEN_AND_TYPE",
}

export enum TaskModeEnum {
  WRITE = "WRITE",
  SELECT = "SELECT",
  CHECKBOX_MULTIPLE = "CHECKBOX_MULTIPLE",
  DRAG_AND_DROP = "DRAG_AND_DROP",
  LISTEN_AND_WRITE = "LISTEN_AND_WRITE",
}

export interface ITaskGeneratorRequest {
  user_id: string
  organization_id: string
  gpt_payload: IGPTPayload
  type: TaskTypeEnum // например: "fill_blank", "multiple_choice" и т.д.
  topic_ids?: string[] // id тем из библиотеки (можно 1 или несколько)
  topic_titles?: string[] // title тем из библиотеки (можно 1 или несколько)
  level_cefr?: VocabularyFrequencyLevelEnum[] // например: ["A1", "A2"]
  context?: string // Смысловой контекст: "покупки", "врач", "в парикмахерской"
  sandbox_prompt?: string // Произвольный текст от пользователя, если он не хочет выбирать тему
  sentence_count?: number
  mode: TaskModeEnum
  blank_count?: number // Опционально: сколько пропусков сгенерировать (если не указано — автоматически)
  language: string // Язык, который изучается
  native_language: string // Родной язык для перевода, если нужно
}

export interface ITaskSentence {
  sentence_with_blanks: string // Например: "Аз ___ студент и ___ в София."
  correct_answers: string[] // ["съм", "живея"]
  options: string[][]
  explanation?: string
}

export interface ITranslationPair {
  source: string // Фраза на изучаемом языке
  correct_target: string // Верный перевод
  distractors?: string[] // Дополнительные, неправильные переводы
  explanation?: string
}

export interface IReorderSentence {
  correct_order: string[] // ["Аз", "съм", "студент"]
  shuffled: string[] // ["съм", "студент", "Аз"]
  explanation?: string
}

export interface IMultipleChoiceQuestion {
  question: string // Формулировка задания
  options: string[] // Варианты ответа
  correct_option_indexes: number[] // Индексы правильных ответов
  explanation?: string
}

export interface ICorrectSentenceItem {
  sentence_with_error: string
  corrected_sentence: string
  explanation?: string
}

export interface IListenAndTypeItem {
  audio_url: string
  correct_transcript: string
  explanation?: string
}

export interface IFillBlankTask {
  sentences: ITaskSentence[]
}

export interface IMatchTranslationTask {
  sentences: ITranslationPair[]
}

export interface IReorderWordsTask {
  sentences: IReorderSentence[]
}

export interface IMultipleChoiceTask {
  sentences: IMultipleChoiceQuestion[]
}

export interface ICorrectSentenceTask {
  sentences: ICorrectSentenceItem[]
}

export interface IListenAndTypeTask {
  sentences: IListenAndTypeItem[]
}

export interface ITaskGeneratorResponse {
  id: string // Уникальный ID задания
  type: TaskTypeEnum // Тип задания (fill_blank, multiple_choice, и т.д.)
  language: string // Язык задания
  native_language: string // Родной язык пользователя (если использован для перевода)
  level_cefr?: VocabularyFrequencyLevelEnum[]
  topic_ids?: string[] // Темы, к которым относится задание
  topic_titles?: string[]
  context?: string // Жизненная ситуация, если указана
  sandbox_prompt?: string // Общая инструкция к заданию
  sentence_count?: number
  mode: TaskModeEnum
  blank_count?: number
  metadata?: Record<string, any> // Любая служебная инфа (для отладки, генерации, кеша)
  data: IFillBlankTask | IMatchTranslationTask | IReorderWordsTask | IMultipleChoiceTask | ICorrectSentenceTask | IListenAndTypeTask
}
