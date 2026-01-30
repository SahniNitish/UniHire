import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use matching worker version from unpkg
GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs`;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract text from PDF file using pdf.js
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        resolve(fullText.trim());
      } catch (error) {
        console.error('PDF extraction error:', error);
        // Fallback to basic extraction if pdf.js fails
        reject(new Error('Could not extract text from PDF. Please ensure the PDF contains selectable text.'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Extract text from DOCX file using mammoth
export const extractTextFromDOCX = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value.trim());
      } catch (error) {
        console.error('DOCX extraction error:', error);
        reject(new Error('Could not extract text from DOCX file.'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Extract text from file based on type
export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return extractTextFromPDF(file);
  } else if (extension === 'docx' || extension === 'doc') {
    return extractTextFromDOCX(file);
  } else if (extension === 'txt') {
    // Handle plain text files
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
  }
};

// Extract contact information from resume text
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

// Convert file to base64 data URL for persistent storage
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractContactInfo = (resumeText: string): ContactInfo => {
  // Extract email using regex
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
  const emailMatch = resumeText.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone using regex (various formats)
  const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = resumeText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // Extract name - typically first line or first few words before email/phone
  let name = '';
  const lines = resumeText.split('\n').filter(line => line.trim());

  // Try to find name in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Skip if line contains email or phone
    if (emailRegex.test(line) || phoneRegex.test(line)) continue;
    // Skip if line is too long (likely a paragraph) or too short
    if (line.length > 50 || line.length < 3) continue;
    // Skip common headers
    if (/^(resume|curriculum vitae|cv|profile|summary|objective|experience|education|skills)/i.test(line)) continue;
    // Likely a name - 2-4 words, mostly letters
    const words = line.split(/\s+/);
    if (words.length >= 1 && words.length <= 4 && /^[A-Za-z\s.-]+$/.test(line)) {
      name = line;
      break;
    }
  }

  // If no name found, use first non-empty line
  if (!name && lines.length > 0) {
    name = lines[0].substring(0, 50);
  }

  return { name, email, phone };
};
