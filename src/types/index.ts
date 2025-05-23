
export interface TestFile {
  id: string;
  fileName: string;
  fileUrl: string;
  durationMinutes: number;
  createdAt: string;
  expiresAt: string;
}

export interface TestSubmission {
  testId: string;
  answers: AnswerFile[];
}

export interface AnswerFile {
  id: string;
  fileName: string;
  fileUrl: string;
}
