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
  suggestion_message: string
  detected_language: string
  is_target_language: boolean
  discussion_topic?: string
  sentence_structure: ErrorAnalysisSentenceStructureEnum
}

export interface IErrorAnalysisEntity {
  session_id: string
  last_user_message: string
  suggestion_message: string
  detected_language: string
  is_target_language: boolean
  discussion_topic?: string
  sentence_structure: ErrorAnalysisSentenceStructureEnum
  issues: IssueItem[]
  has_errors: boolean
  updated_at: Date
  created_at: Date
}

export interface IErrorAnalysisRequest {
  gpt_payload: IGPTPayload
  session_id: string
  target_language: string
  user_language: string
  discussion_topic?: string
}
