import { IGPTPayload } from "./IGPT"

export enum ErrorAnalysisSentenceStructureEnum {
  SIMPLE = "SIMPLE",
  COMPOUND = "COMPOUND",
  COMPLEX = "COMPLEX",
}

export interface IWord {
  id: number
  value: string
}

export interface IssueItem {
  original_text: string
  corrected_text: string
  error_words: IWord[]
  corrected_words: IWord[]
  explanation: string
  topic_titles: string
}

export interface IErrorAnalysisModelEntity {
  issues: IssueItem[]
  has_errors: boolean
  is_end: boolean
  improve_user_answer: string
  suggestion_message: string
  detected_language: string
  is_target_language: boolean
  sentence_structure: ErrorAnalysisSentenceStructureEnum
}

export interface IErrorAnalysisEntity {
  session_id: string
  improve_user_answer: string
  last_user_message: string
  suggestion_message: string
  detected_language: string
  is_target_language: boolean
  prompt_id: string
  sentence_structure: ErrorAnalysisSentenceStructureEnum
  issues: IssueItem[]
  has_errors: boolean
  is_end: boolean
  updated_at: Date
  created_at: Date
}

export interface IErrorAnalysisRequest {
  gpt_payload: IGPTPayload
  session_id: string
  target_language: string
  explanation_language: string
  prompt_id: string
}
