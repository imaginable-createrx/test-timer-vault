
export interface TestFile {
  id: string;
  file_name: string;
  file_url: string;
  duration_minutes: number;
  created_at: string;
  expires_at: string;
  created_by?: string;
}

export interface TestSubmission {
  id: string;
  test_id: string;
  submitted_at: string;
  submitted_by?: string;
}

export interface AnswerFile {
  id: string;
  submission_id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}
