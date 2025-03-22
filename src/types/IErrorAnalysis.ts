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

export interface IErrorAnalysisResponse {
  issues: IssueItem[]
  summary_comment?: string
  has_errors: boolean
}
