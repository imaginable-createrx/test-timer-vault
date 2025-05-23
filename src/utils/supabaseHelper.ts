
import { supabase } from "@/integrations/supabase/client";
import { TestFile, TestSubmission, AnswerFile } from "@/types";

// Upload a file to Supabase storage
export const uploadFile = async (file: File, bucket: string, fileName: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

// Create a test file record in the database
export const createTestFile = async (testFile: Omit<TestFile, 'id' | 'created_at'>): Promise<TestFile> => {
  const { data, error } = await supabase
    .from('test_files')
    .insert([testFile])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test file: ${error.message}`);
  }

  return data;
};

// Get a test file by ID
export const getTestFile = async (testId: string): Promise<TestFile | null> => {
  const { data, error } = await supabase
    .from('test_files')
    .select('*')
    .eq('id', testId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No data found
    }
    throw new Error(`Failed to fetch test file: ${error.message}`);
  }

  // Check if test has expired
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  
  if (now > expiresAt) {
    return null; // Test has expired
  }

  return data;
};

// Create a test submission
export const createTestSubmission = async (testId: string): Promise<TestSubmission> => {
  const { data, error } = await supabase
    .from('test_submissions')
    .insert([{ test_id: testId }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create submission: ${error.message}`);
  }

  return data;
};

// Create answer files
export const createAnswerFiles = async (submissionId: string, answerFiles: { file_name: string; file_url: string }[]): Promise<AnswerFile[]> => {
  const answerFilesData = answerFiles.map(file => ({
    submission_id: submissionId,
    file_name: file.file_name,
    file_url: file.file_url
  }));

  const { data, error } = await supabase
    .from('answer_files')
    .insert(answerFilesData)
    .select();

  if (error) {
    throw new Error(`Failed to create answer files: ${error.message}`);
  }

  return data;
};

// Generate a unique file name
export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
};

// Generate test link
export const generateTestLink = (testId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/test/${testId}`;
};

// Format time remaining
export const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
};
