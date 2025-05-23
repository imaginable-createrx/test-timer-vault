
import { TestFile } from "../types";

// Generate a random ID for files
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Create a local storage key with expiration for test files
export const storeTestFile = (testFile: TestFile): void => {
  const storageItem = {
    ...testFile,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };
  
  localStorage.setItem(`test_${testFile.id}`, JSON.stringify(storageItem));
};

// Retrieve a test file from local storage if it exists and hasn't expired
export const getTestFile = (testId: string): TestFile | null => {
  const storedItem = localStorage.getItem(`test_${testId}`);
  
  if (!storedItem) {
    return null;
  }
  
  const testFile = JSON.parse(storedItem) as TestFile;
  const now = new Date();
  const expiresAt = new Date(testFile.expiresAt);
  
  if (now > expiresAt) {
    // Test has expired, remove it
    localStorage.removeItem(`test_${testId}`);
    return null;
  }
  
  return testFile;
};

// Create a data URL for the PDF file
export const createFileUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Generate a shareable link for the test
export const generateTestLink = (testId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/test/${testId}`;
};

// Calculate time remaining in a human-readable format
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
