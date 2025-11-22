import React, { useCallback } from 'react';
import { getFileType } from '../services/fileProcessor';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, disabled }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (getFileType(file)) {
          onFileSelected(file);
        } else {
          alert("Please upload a PDF or Word document (.docx)");
        }
        e.dataTransfer.clearData();
      }
    },
    [disabled, onFileSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (getFileType(file)) {
        onFileSelected(file);
      } else {
        alert("Please upload a PDF or Word document (.docx)");
      }
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        relative w-full p-10 border-2 border-dashed rounded-xl transition-all duration-200
        flex flex-col items-center justify-center text-center
        ${
          disabled
            ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed'
            : 'border-indigo-300 bg-indigo-50/30 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
        }
      `}
    >
      <input
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="p-4 bg-white rounded-full shadow-sm mb-4 text-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Click to upload or drag and drop
      </h3>
      <p className="text-sm text-gray-500">
        Supported formats: PDF, Word (.docx)
      </p>
    </div>
  );
};