
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTestFile } from "@/utils/pdfHelper";
import { TestFile } from "@/types";
import PDFViewer from "@/components/PDFViewer";
import TestTimer from "@/components/TestTimer";
import AnswerUploader from "@/components/AnswerUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const TestPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<TestFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEnded, setTestEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTest = () => {
      if (!testId) {
        setError("Invalid test ID");
        setLoading(false);
        return;
      }

      const testData = getTestFile(testId);
      
      if (!testData) {
        setError("Test not found or has expired");
        setLoading(false);
        return;
      }
      
      setTest(testData);
      setLoading(false);
    };
    
    loadTest();
  }, [testId]);

  const handleTestEnd = () => {
    setTestEnded(true);
    toast({
      title: "Test ended",
      description: "Please submit your answers now.",
    });
  };

  const handleSubmitComplete = () => {
    toast({
      title: "Thank you!",
      description: "Your answers have been submitted successfully.",
    });
    
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 rounded-full p-3 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Test Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button
          onClick={() => navigate("/")}
          className="btn-hover"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  if (testEnded) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Test Complete: Submit Your Answers
            </h1>
            <AnswerUploader testId={testId || ""} onSubmitComplete={handleSubmitComplete} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-4">
        {test && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{test.fileName}</h1>
            <p className="text-sm text-muted-foreground">
              Time allowed: {test.durationMinutes} minutes
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-[70vh]">
            {test && (
              <PDFViewer fileUrl={test.fileUrl} fileName={test.fileName} />
            )}
          </div>
          <div>
            {test && (
              <TestTimer 
                durationMinutes={test.durationMinutes} 
                onTimeEnd={handleTestEnd} 
              />
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (confirm("Are you sure you want to end this test?")) {
                    handleTestEnd();
                  }
                }}
              >
                End Test Early
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
