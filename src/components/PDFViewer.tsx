
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut, AlertCircle, Download } from "lucide-react";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [scale, setScale] = useState(1.0);
  const embedRef = useRef<HTMLEmbedElement>(null);
  
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Add a timeout to handle loading state
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(loadTimer);
  }, [fileUrl]);

  const handleEmbedLoad = () => {
    console.log("PDF embed loaded successfully");
    setIsLoading(false);
    setHasError(false);
  };

  const handleEmbedError = () => {
    console.log("PDF embed failed to load");
    setIsLoading(false);
    setHasError(true);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  // Force inline viewing with proper PDF parameters
  const inlinePdfUrl = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`;

  return (
    <div className="pdf-container flex flex-col h-full animate-in border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-100 p-3 flex items-center justify-between border-b">
        <h3 className="font-medium truncate flex-1 text-center">{fileName}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            disabled={scale >= 3.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-4 z-10">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <p className="text-sm text-muted-foreground mt-4">Loading PDF...</p>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-4">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">PDF Display Error</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Unable to display the PDF. Please check your browser settings.
            </p>
            <Button
              onClick={() => window.open(fileUrl, '_blank')}
              variant="outline"
            >
              Open in New Tab
            </Button>
          </div>
        ) : (
          <div 
            className="w-full h-full relative"
            style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: 'top left',
              width: `${100 / scale}%`,
              height: `${100 / scale}%`
            }}
          >
            <embed
              ref={embedRef}
              src={inlinePdfUrl}
              type="application/pdf"
              className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
              onLoad={handleEmbedLoad}
              onError={handleEmbedError}
              style={{
                border: 'none',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
