
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { uploadFile, createTestSubmission, createAnswerFiles, generateFileName } from "@/utils/supabaseHelper";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Check, FileImage } from "lucide-react";

interface AnswerUploaderProps {
  testId: string;
  onSubmitComplete: () => void;
}

interface AnswerFileLocal {
  id: string;
  fileName: string;
  file: File;
}

const AnswerUploader: React.FC<AnswerUploaderProps> = ({ testId, onSubmitComplete }) => {
  const [answerFiles, setAnswerFiles] = useState<AnswerFileLocal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const newFiles: AnswerFileLocal[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload only images or PDFs.`,
        });
        continue;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
        });
        continue;
      }
      
      newFiles.push({
        id: Math.random().toString(36).substring(2, 15),
        fileName: file.name,
        file
      });
    }
    
    setAnswerFiles((prevFiles) => [...prevFiles, ...newFiles]);
    
    // Reset the input
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setAnswerFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const handleSubmit = async () => {
    if (answerFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files to submit",
        description: "Please upload at least one answer file before submitting.",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create test submission first
      const submission = await createTestSubmission(testId);
      
      // Upload all files to Supabase storage
      const uploadPromises = answerFiles.map(async (answerFile) => {
        const fileName = generateFileName(answerFile.fileName);
        const fileUrl = await uploadFile(answerFile.file, 'answer_files', fileName);
        return {
          file_name: answerFile.fileName,
          file_url: fileUrl
        };
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Create answer file records in database
      await createAnswerFiles(submission.id, uploadedFiles);
      
      toast({
        title: "Answers submitted successfully!",
        description: "Your answers have been uploaded and saved.",
      });
      
      onSubmitComplete();
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error instanceof Error ? error.message : "There was an error submitting your answers. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-in">
      <CardHeader>
        <CardTitle className="text-xl">Submit Your Answers</CardTitle>
        <CardDescription>
          Upload images or PDFs of your completed answers for this test.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="answer-files" className="text-lg font-medium">
            Upload Answer Files
          </Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
            <Input
              id="answer-files"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="answer-files" className="cursor-pointer w-full h-full block">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images or PDFs (max 10MB each)
              </p>
            </label>
          </div>
        </div>
        
        {answerFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-lg font-medium">Files to Submit</Label>
            <div className="space-y-2 max-h-80 overflow-y-auto p-1">
              {answerFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-muted/50 p-3 rounded-md"
                >
                  <div className="flex items-center">
                    <FileImage className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm truncate max-w-xs">{file.fileName}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({(file.file.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {answerFiles.length} file(s) ready to submit
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full btn-hover"
          disabled={isSubmitting || answerFiles.length === 0}
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Submit Answers
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnswerUploader;
