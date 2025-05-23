
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { uploadFile, createTestFile, generateFileName, generateTestLink } from "@/utils/supabaseHelper";
import { useToast } from "@/components/ui/use-toast";
import { Timer } from "lucide-react";

const PDFUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [isUploading, setIsUploading] = useState(false);
  const [testLink, setTestLink] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    if (selectedFile.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
      });
      return;
    }
    
    setFile(selectedFile);
    setTestLink(null);
  };

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a PDF file to upload.",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Generate unique filename and upload to Supabase storage
      const fileName = generateFileName(file.name);
      const fileUrl = await uploadFile(file, 'test_files', fileName);
      
      // Create test file record in database
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
      
      const testFile = await createTestFile({
        file_name: file.name,
        file_url: fileUrl,
        duration_minutes: duration,
        expires_at: expiresAt
      });
      
      const link = generateTestLink(testFile.id);
      setTestLink(link);
      
      toast({
        title: "Test created successfully!",
        description: "Your test link is ready to share.",
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error creating your test. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-in">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-file" className="text-lg font-medium">
              Upload Test PDF
            </Label>
            <Input
              id="pdf-file"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="duration" className="text-lg font-medium">
                  Test Duration
                </Label>
                <span className="text-sm font-medium text-primary">
                  {duration} minutes
                </span>
              </div>
              <Slider
                id="duration"
                defaultValue={[60]}
                min={5}
                max={180}
                step={5}
                onValueChange={handleDurationChange}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>3 hours</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleUpload}
            className="w-full btn-hover group"
            disabled={isUploading || !file}
          >
            <Timer className="mr-2 h-4 w-4 group-hover:animate-pulse-gentle" />
            {isUploading ? "Creating Test..." : "Create Timed Test"}
          </Button>
          
          {testLink && (
            <div className="bg-blue-50 rounded-md p-4 border border-blue-200">
              <Label className="text-sm font-medium text-blue-800">
                Test Link (valid for 24 hours)
              </Label>
              <div className="flex mt-2">
                <Input 
                  value={testLink}
                  readOnly
                  className="text-sm"
                />
                <Button
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(testLink);
                    toast({
                      description: "Link copied to clipboard!",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Share this link with your students. The test will expire after 24 hours.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFUploader;
