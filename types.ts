export interface ProcessedFile {
  file: File;
  type: 'pdf' | 'word';
  content?: string; // For Word files (extracted text)
  base64?: string; // For PDF files
}

export interface SummaryResult {
  text: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING_FILE = 'PROCESSING_FILE',
  GENERATING_SUMMARY = 'GENERATING_SUMMARY',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}