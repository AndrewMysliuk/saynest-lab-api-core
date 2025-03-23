export interface IWord {
  id: string
  value: string
}

export interface IssueItem {
  original_text: string
  corrected_text: string
  error_words: IWord[]
  corrected_words: IWord[]
  explanation: string
  topic_tag: string
}

export interface IErrorAnalysisModelEntity {
  issues: IssueItem[]
  summary_comment?: string
  has_errors: boolean
}

export interface IErrorAnalysisEntity {
  session_id: string
  message: string
  issues: IssueItem[]
  summary_comment?: string
  has_errors: boolean
  created_at: Date
}
