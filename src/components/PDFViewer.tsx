
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut, AlertCircle, Download, ChevronLeft, ChevronRight } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    loadPDF();
  }, [fileUrl]);

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage();
    }
  }, [pdfDoc, currentPage, scale]);

  const loadPDF = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      console.log("Loading PDF with PDF.js...");
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      console.log("PDF loaded successfully with", pdf.numPages, "pages");
      
    } catch (error) {
      console.error("Error loading PDF:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      console.log(`Rendered page ${currentPage}`);
    } catch (error) {
      console.error("Error rendering page:", error);
      setHasError(true);
    }
  };

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

      <div className="flex-1 relative overflow-auto bg-gray-100 flex items-center justify-center">
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
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full border shadow-lg ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            style={{
              display: isLoading ? 'none' : 'block'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
