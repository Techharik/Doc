import mammoth from 'mammoth';

/**
 * Reads a file as a Base64 string (useful for PDF transport to Gemini).
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file as base64 string'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Extracts raw text from a DOCX file using Mammoth.
 */
export const readDocxAsText = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error reading DOCX:", error);
    throw new Error("Failed to extract text from Word document.");
  }
};

export const getFileType = (file: File): 'pdf' | 'word' | null => {
  if (file.type === 'application/pdf') return 'pdf';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword' ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.doc')
  ) {
    return 'word';
  }
  return null;
};