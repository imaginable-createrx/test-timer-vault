
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut, AlertCircle, Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewerMethod, setViewerMethod] = useState<'iframe' | 'object' | 'embed'>('iframe');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Try different loading methods in sequence
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [fileUrl, viewerMethod]);

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    
    // Cycle through different viewer methods
    if (viewerMethod === 'iframe') {
      setViewerMethod('object');
    } else if (viewerMethod === 'object') {
      setViewerMethod('embed');
    } else {
      setViewerMethod('iframe');
    }
  };

  const onLoadError = () => {
    console.log(`PDF loading failed with ${viewerMethod} method`);
    setHasError(true);
    setIsLoading(false);
  };

  const onLoadSuccess = () => {
    console.log(`PDF loaded successfully with ${viewerMethod} method`);
    setIsLoading(false);
    setHasError(false);
  };

  // Create the PDF URL with proper parameters to force inline viewing
  const pdfUrl = `${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=${currentPage}&zoom=${Math.round(scale * 100)}`;

  const renderPDFViewer = () => {
    const commonStyle = {
      width: '100%',
      height: '100%',
      border: 'none',
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    };

    switch (viewerMethod) {
      case 'iframe':
        return (
          <iframe
            src={pdfUrl}
            style={commonStyle}
            onLoad={onLoadSuccess}
            onError={onLoadError}
            title={fileName}
            allow="fullscreen"
          />
        );
      
      case 'object':
        return (
          <object
            data={pdfUrl}
            type="application/pdf"
            style={commonStyle}
            onLoad={onLoadSuccess}
            onError={onLoadError}
          >
            <p>Your browser does not support PDFs. Please download the PDF to view it.</p>
          </object>
        );
      
      case 'embed':
        return (
          <embed
            src={pdfUrl}
            type="application/pdf"
            style={commonStyle}
            onLoad={onLoadSuccess}
            onError={onLoadError}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="pdf-container flex flex-col h-full animate-in border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-100 p-3 flex items-center justify-between border-b">
        <h3 className="font-medium truncate flex-1 text-center">{fileName}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            className="h-8 w-8 p-0"
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            className="h-8 w-8 p-0"
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
          {hasError && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
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
            <h3 className="text-lg font-medium mb-2">PDF Display Issue</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Trying different display method: {viewerMethod}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Different Method
              </Button>
              <Button
                onClick={() => window.open(fileUrl, '_blank')}
                variant="outline"
              >
                Open in New Tab
              </Button>
            </div>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            style={{
              overflow: scale > 1 ? 'auto' : 'hidden'
            }}
          >
            {renderPDFViewer()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
