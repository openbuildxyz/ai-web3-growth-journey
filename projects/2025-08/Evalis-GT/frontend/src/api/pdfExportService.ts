import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // side-effect import for table plugin (even if not used now)

// Define our own interface for Question to avoid circular dependency
export interface PDFQuestion {
  text: string;
  marks: number;
  type: 'mcq' | 'short' | 'long';
  image?: {
    url: string;
    caption?: string;
  };
}

interface PDFExportParams {
  title: string;
  subject: string;
  examType: string;
  duration: number;
  questions: PDFQuestion[];
  institution?: string;
}

// Removed unused dataURLtoBlob helper (not referenced)

// Load image and return base64 data
const loadImage = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = img.height;
      canvas.width = img.width;
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

// Generate PDF for question paper
export const generateQuestionPaperPDF = async (params: PDFExportParams): Promise<Blob> => {
  const { title, subject, examType, duration, questions, institution } = params;
  
  // Create new PDF document (A4 format)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set font
  doc.setFont('helvetica');
  
  // Add institution name if provided
  if (institution) {
    doc.setFontSize(12);
    doc.text(institution, doc.internal.pageSize.width / 2, 15, { align: 'center' });
  }
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, doc.internal.pageSize.width / 2, institution ? 25 : 15, { align: 'center' });
  
  // Add metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const metadataY = institution ? 32 : 22;
  doc.text(`Subject: ${subject}`, 20, metadataY);
  doc.text(`Exam Type: ${examType}`, doc.internal.pageSize.width - 20, metadataY, { align: 'right' });
  doc.text(`Duration: ${duration} minutes`, 20, metadataY + 5);
  doc.text(`Total Marks: ${questions.reduce((sum, q) => sum + q.marks, 0)}`, doc.internal.pageSize.width - 20, metadataY + 5, { align: 'right' });
  
  // Add a line separator
  doc.setLineWidth(0.5);
  doc.line(20, metadataY + 8, doc.internal.pageSize.width - 20, metadataY + 8);
  
  // Instructions
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Instructions: Review all questions. This is a question paper only with no answer spaces provided.', 20, metadataY + 15);
  
  // Start Y position for questions
  let yPosition = metadataY + 25;
  
  // Add each question
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    // Add question number and text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const questionPrefix = `Q${i + 1}. `;
    const questionText = `${questionPrefix}${question.text} [${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}]`;
    
    // Split text to check if we need a new page
    const textLines = doc.splitTextToSize(questionText, doc.internal.pageSize.width - 40);
    
    // Check if we need to add a new page
    if (yPosition + (textLines.length * 5) + 10 > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add question text
    doc.text(textLines, 20, yPosition);
    yPosition += textLines.length * 5 + 5;
    
    // Add image if present
    if (question.image && question.image.url) {
      // Ensure we don't run out of space
      if (yPosition + 60 > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      try {
        // Load and process the image
        const imgData = await loadImage(question.image.url);
        
        // Calculate image dimensions to fit within page (max width 150mm, max height 60mm)
        const imgProps = doc.getImageProperties(imgData);
        let imgWidth = doc.internal.pageSize.width - 40;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        // Adjust if image is too tall
        if (imgHeight > 60) {
          imgHeight = 60;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }
        
        // Center the image horizontally
        const xOffset = (doc.internal.pageSize.width - imgWidth) / 2;
        
        // Add the image
        doc.addImage(imgData, 'JPEG', xOffset, yPosition, imgWidth, imgHeight);
        
        // Update position
        yPosition += imgHeight + 5;
        
        // Add caption if available
        if (question.image.caption) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text(`Figure: ${question.image.caption}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
          yPosition += 5;
        }
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('[Image could not be displayed]', 20, yPosition);
        yPosition += 5;
      }
    }
    
    // Add additional spacing between questions
    yPosition += 10;
  }
  
  // Add footer with page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }
  
  // Return PDF as blob
  return doc.output('blob');
};

export default {
  generateQuestionPaperPDF
}; 