
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PDFUploader from "@/components/PDFUploader";
import { Timer } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-timerblue to-timerteal bg-clip-text text-transparent animate-in">
              Test Timer Vault
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Secure, timed online exams with automatic expiration after 24 hours.
            </p>
          </div>
          
          <div className="grid w-full gap-6 md:grid-cols-2 lg:gap-12">
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-center mb-2">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Timer className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">How It Works</CardTitle>
                <CardDescription>
                  Simple, secure, and effective testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="mr-2 rounded-full bg-primary/20 p-1 text-primary">
                      1
                    </div>
                    <p className="text-sm">
                      <strong>Upload your test PDF</strong> and set the time limit
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 rounded-full bg-primary/20 p-1 text-primary">
                      2
                    </div>
                    <p className="text-sm">
                      <strong>Share the generated link</strong> with your students
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 rounded-full bg-primary/20 p-1 text-primary">
                      3
                    </div>
                    <p className="text-sm">
                      <strong>Students take the test</strong> with the countdown timer
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 rounded-full bg-primary/20 p-1 text-primary">
                      4
                    </div>
                    <p className="text-sm">
                      <strong>Collect their answers</strong> when they submit or time expires
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Test links automatically expire after 24 hours for security.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col">
              <h2 className="text-xl font-bold mb-4">Create a New Test</h2>
              <PDFUploader />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
