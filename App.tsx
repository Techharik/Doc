import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { SummaryView } from './components/SummaryView';
import { AppStatus, ProcessedFile } from './types';
import { getFileType, readDocxAsText, readFileAsBase64 } from './services/fileProcessor';
import { generateDocumentSummary } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentFile, setCurrentFile] = useState<ProcessedFile | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    const type = getFileType(file);
    if (!type) return;

    setStatus(AppStatus.PROCESSING_FILE);
    setErrorMsg('');
    setSummary('');
    
    try {
      const processed: ProcessedFile = {
        file,
        type,
      };

      if (type === 'word') {
        // Extract text immediately for word
        processed.content = await readDocxAsText(file);
      } else {
        // Prepare PDF base64 immediately
        processed.base64 = await readFileAsBase64(file);
      }

      setCurrentFile(processed);
      setStatus(AppStatus.IDLE); // Ready to summarize
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to read file content. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleSummarize = async () => {
    if (!currentFile) return;

    setStatus(AppStatus.GENERATING_SUMMARY);
    setErrorMsg('');

    try {
      const result = await generateDocumentSummary(currentFile);
      setSummary(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred while communicating with Gemini AI. Please check your connection or try a smaller file.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setCurrentFile(null);
    setSummary('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          
          {/* Intro Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Summarize Documents <span className="text-indigo-600">Instantly</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Upload your PDF or Word documents and let our AI extract key insights, action items, and summaries in seconds.
            </p>
          </div>

          {/* Main Interaction Area */}
          <div className="grid grid-cols-1 gap-8">
            
            {/* Upload & Controls */}
            {!summary && (
              <div className="max-w-2xl mx-auto w-full space-y-6">
                {!currentFile ? (
                  <FileUpload 
                    onFileSelected={handleFileSelect} 
                    disabled={status === AppStatus.PROCESSING_FILE}
                  />
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                         {currentFile.type === 'pdf' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                              <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V12z" clipRule="evenodd" />
                            </svg>
                         ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                            </svg>
                         )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">{currentFile.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB • {currentFile.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleReset}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Remove file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleSummarize}
                  disabled={!currentFile || status === AppStatus.GENERATING_SUMMARY}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200
                    flex items-center justify-center gap-2
                    ${!currentFile || status === AppStatus.GENERATING_SUMMARY 
                      ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0'
                    }
                  `}
                >
                  {status === AppStatus.GENERATING_SUMMARY ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      Generate Summary
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error State */}
            {status === AppStatus.ERROR && (
              <div className="max-w-2xl mx-auto w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600 mt-0.5">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-900">Processing Error</h4>
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Results Area */}
            {status === AppStatus.SUCCESS && summary && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
                 <SummaryView summary={summary} />
                 
                 <div className="flex justify-center">
                   <button 
                     onClick={handleReset}
                     className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                     </svg>
                     Summarize Another Document
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;