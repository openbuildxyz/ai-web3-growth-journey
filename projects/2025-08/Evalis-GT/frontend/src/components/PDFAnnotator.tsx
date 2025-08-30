import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Check, 
  X, 
  Edit3, 
  Save,
  ZoomIn,
  ZoomOut,
  Trash2,
  MessageCircle
} from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Sanitize text to be PDF-compatible (ASCII only)
const sanitizeText = (text: string): string => {
  // Replace common Unicode characters with ASCII equivalents
  return text
    .replace(/[\u2018\u2019]/g, "'") // Smart quotes to straight quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // En/em dashes to hyphens
    .replace(/[\u2026]/g, '...') // Ellipsis
    .replace(/[^\x20-\x7E]/g, '?'); // Replace any non-ASCII with question mark
};

interface Annotation {
  id: string;
  type: 'tick' | 'cross' | 'comment' | 'highlight';
  x: number;
  y: number;
  pageNumber: number;
  text?: string;
  color?: string;
}

interface PDFAnnotatorProps {
  fileUrl: string;
  studentName: string;
  submissionId: string | number;
  onSave: (annotations: Annotation[], gradedPdfUrl: string) => void;
  existingAnnotations?: Annotation[];
}

const PDFAnnotator: React.FC<PDFAnnotatorProps> = ({
  fileUrl,
  studentName,
  submissionId,
  onSave,
  existingAnnotations = []
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [annotations, setAnnotations] = useState<Annotation[]>(existingAnnotations);
  const [selectedTool, setSelectedTool] = useState<'tick' | 'cross' | 'comment' | 'highlight' | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<Omit<Annotation, 'id' | 'text'> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pageRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageClick = (event: React.MouseEvent) => {
    if (!selectedTool || !pageRef.current) return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (selectedTool === 'comment') {
      setPendingAnnotation({
        type: 'comment',
        x,
        y,
        pageNumber: currentPage,
        color: '#ff6b6b'
      });
      setShowCommentInput(true);
    } else {
      const newAnnotation: Annotation = {
        id: `${Date.now()}-${Math.random()}`,
        type: selectedTool,
        x,
        y,
        pageNumber: currentPage,
        color: selectedTool === 'tick' ? '#51cf66' : selectedTool === 'cross' ? '#ff6b6b' : '#ffd43b'
      };

      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const addComment = () => {
    if (!pendingAnnotation || !commentText.trim()) return;

    const newAnnotation: Annotation = {
      id: `${Date.now()}-${Math.random()}`,
      ...pendingAnnotation,
      text: commentText.trim()
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setCommentText('');
    setShowCommentInput(false);
    setPendingAnnotation(null);
  };

  const cancelComment = () => {
    setCommentText('');
    setShowCommentInput(false);
    setPendingAnnotation(null);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const uploadGradedPDF = async (pdfBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, `graded_${submissionId}_${Date.now()}.pdf`);
      
      const response = await fetch('/api/submissions/upload/graded-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload graded PDF');
      }
      
      const result = await response.json();
      return result.fileUrl;
    } catch (error) {
      console.error('Error uploading graded PDF:', error);
      throw error;
    }
  };

  const generateAnnotatedPDF = async (): Promise<string> => {
    try {
      setIsLoading(true);
      
      // Fetch the original PDF
      const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Add annotations to each page
      for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        
        const pageAnnotations = annotations.filter(ann => ann.pageNumber === i + 1);
        
        for (const annotation of pageAnnotations) {
          const x = (annotation.x / 100) * width;
          const y = height - (annotation.y / 100) * height; // PDF coordinates are from bottom

          switch (annotation.type) {
            case 'tick':
              // Draw a checkmark using ASCII-compatible character
              page.drawText('v', {
                x: x - 10,
                y: y - 10,
                size: 20,
                font: helveticaFont,
                color: rgb(0.32, 0.81, 0.4)
              });
              break;

            case 'cross':
              // Draw an X using ASCII character
              page.drawText('X', {
                x: x - 10,
                y: y - 10,
                size: 20,
                font: helveticaFont,
                color: rgb(1, 0.42, 0.42)
              });
              break;

            case 'comment':
              // Draw a comment indicator using ASCII character
              page.drawText('C', {
                x: x - 10,
                y: y - 5,
                size: 16,
                font: helveticaFont,
                color: rgb(0.2, 0.6, 1)
              });
              
              if (annotation.text) {
                // Draw comment text with sanitized content
                const sanitizedText = sanitizeText(annotation.text);
                page.drawText(sanitizedText, {
                  x: x + 20,
                  y: y - 5,
                  size: 10,
                  font: helveticaFont,
                  color: rgb(1, 0.42, 0.42),
                  maxWidth: 200
                });
              }
              break;

            case 'highlight':
              // Draw a highlight rectangle
              page.drawRectangle({
                x: x - 20,
                y: y - 15,
                width: 40,
                height: 20,
                color: rgb(1, 0.84, 0.27),
                opacity: 0.3
              });
              break;
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      // Upload the PDF to server and return the server URL
      const serverUrl = await uploadGradedPDF(blob);
      return serverUrl;
    } catch (error) {
      console.error('Error generating annotated PDF:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const gradedPdfUrl = await generateAnnotatedPDF();
      onSave(annotations, gradedPdfUrl);
    } catch (error) {
      console.error('Error saving annotations:', error);
      alert('Failed to save annotations. Please try again.');
    }
  };

  const currentPageAnnotations = annotations.filter(ann => ann.pageNumber === currentPage);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Grade Submission - {studentName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Page {currentPage} of {numPages}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {annotations.length} annotations
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Toolbar */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Annotation Tools */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Tools:</span>
              <Button
                variant={selectedTool === 'tick' ? 'default' : 'outline'}
                size="sm"
                className={selectedTool === 'tick' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => setSelectedTool(selectedTool === 'tick' ? null : 'tick')}
              >
                <Check className="h-4 w-4 mr-1" />
                Correct
              </Button>
              <Button
                variant={selectedTool === 'cross' ? 'default' : 'outline'}
                size="sm"
                className={selectedTool === 'cross' ? 'bg-red-600 hover:bg-red-700' : ''}
                onClick={() => setSelectedTool(selectedTool === 'cross' ? null : 'cross')}
              >
                <X className="h-4 w-4 mr-1" />
                Wrong
              </Button>
              <Button
                variant={selectedTool === 'comment' ? 'default' : 'outline'}
                size="sm"
                className={selectedTool === 'comment' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                onClick={() => setSelectedTool(selectedTool === 'comment' ? null : 'comment')}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Comment
              </Button>
              <Button
                variant={selectedTool === 'highlight' ? 'default' : 'outline'}
                size="sm"
                className={selectedTool === 'highlight' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                onClick={() => setSelectedTool(selectedTool === 'highlight' ? null : 'highlight')}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Highlight
              </Button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-1" />
                {isLoading ? 'Saving...' : 'Save Grade'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer */}
      <div className="flex-1 flex">
        {/* Main PDF View */}
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-auto">
          <div className="p-4">
            <div 
              ref={pageRef}
              className="relative inline-block"
              style={{ cursor: selectedTool ? 'crosshair' : 'default' }}
              onClick={handlePageClick}
            >
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="text-center py-8">Loading PDF...</div>}
                error={<div className="text-center py-8 text-red-600">Error loading PDF</div>}
              >
                <Page 
                  pageNumber={currentPage} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              {/* Render Annotations */}
              {currentPageAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                  }}
                >
                  {annotation.type === 'tick' && (
                    <div className="text-green-600 text-xl font-bold">✓</div>
                  )}
                  {annotation.type === 'cross' && (
                    <div className="text-red-600 text-xl font-bold">✗</div>
                  )}
                  {annotation.type === 'comment' && (
                    <div className="relative">
                      <div className="text-blue-600 text-lg">💬</div>
                      {annotation.text && (
                        <div className="absolute top-6 left-0 bg-yellow-100 border border-yellow-300 rounded p-2 text-xs max-w-48 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          {annotation.text}
                        </div>
                      )}
                    </div>
                  )}
                  {annotation.type === 'highlight' && (
                    <div className="w-8 h-4 bg-yellow-300 opacity-50 rounded"></div>
                  )}
                  <button
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnotation(annotation.id);
                    }}
                  >
                    <Trash2 className="h-2 w-2" />
                  </button>
                </div>
              ))}
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Annotations List */}
        <div className="w-80 bg-white rounded-lg shadow-sm ml-4 overflow-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Annotations ({annotations.length})</h3>
            <div className="space-y-2">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="p-3 border border-gray-200 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      Page {annotation.pageNumber}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {annotation.type}
                    </Badge>
                  </div>
                  {annotation.text && (
                    <p className="text-gray-600 text-xs">{annotation.text}</p>
                  )}
                  <button
                    className="text-red-500 hover:text-red-700 text-xs mt-1"
                    onClick={() => removeAnnotation(annotation.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {annotations.length === 0 && (
                <p className="text-gray-500 text-sm">No annotations yet. Click on tools above and then click on the PDF to add annotations.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Input Modal */}
      {showCommentInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Enter your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={addComment} disabled={!commentText.trim()}>
                Add Comment
              </Button>
              <Button variant="outline" onClick={cancelComment}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFAnnotator;
