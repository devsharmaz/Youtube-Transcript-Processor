import React, { useState } from 'react';
import { Send, FileText, Loader2, CheckCircle, AlertCircle, Settings, Copy, Check } from 'lucide-react';

interface TranscriptResponse {
  content: string;
  success: boolean;
  error?: string;
}

function App() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<TranscriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const apiResponse = await fetch('http://127.0.0.1:9010/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_url: userInput.trim()
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`);
      }

      const responseText = await apiResponse.text();
      setResponse({
        content: responseText,
        success: true
      });
    } catch (error) {
      setResponse({
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!response?.content) return;
    
    try {
      // Extract text content from HTML while preserving formatting
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.content, 'text/html');
      
      // Convert HTML to formatted text while preserving structure
      let textContent = '';
      
      // Process each element to maintain proper spacing and line breaks
      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          
          let content = '';
          for (const child of Array.from(node.childNodes)) {
            content += processNode(child);
          }
          
          // Add appropriate line breaks and formatting based on HTML tags
          switch (tagName) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              return `\n${content}\n`;
            case 'p':
              return `${content}\n\n`;
            case 'br':
              return '\n';
            case 'hr':
              return '\n---\n\n';
            case 'li':
              return `- ${content}\n`;
            case 'ul':
            case 'ol':
              return `${content}\n`;
            case 'div':
              return `${content}\n`;
            default:
              return content;
          }
        }
        
        return '';
      };
      
      textContent = processNode(doc.body);
      
      // Clean up excessive line breaks while preserving intentional spacing
      textContent = textContent
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with 2
        .replace(/^\n+/, '') // Remove leading newlines
        .replace(/\n+$/, ''); // Remove trailing newlines
      
      await navigator.clipboard.writeText(textContent);
      setIsCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      
      // Use the same formatting logic for fallback
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.content, 'text/html');
      
      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          
          let content = '';
          for (const child of Array.from(node.childNodes)) {
            content += processNode(child);
          }
          
          switch (tagName) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              return `\n${content}\n`;
            case 'p':
              return `${content}\n\n`;
            case 'br':
              return '\n';
            case 'hr':
              return '\n---\n\n';
            case 'li':
              return `- ${content}\n`;
            case 'ul':
            case 'ol':
              return `${content}\n`;
            case 'div':
              return `${content}\n`;
            default:
              return content;
          }
        }
        
        return '';
      };
      
      let textContent = processNode(doc.body);
      textContent = textContent
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\n+/, '')
        .replace(/\n+$/, '');
      
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const formatHTMLContent = (htmlString: string) => {
    // Parse the HTML and create a clean, readable format
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Extract content and format it
    const content = doc.body.innerHTML;
    return content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-800">Transcript Processor</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform your meeting transcripts into structured, readable content with our intelligent processing engine.
          </p>
        </div>

        {/* Main Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="transcript-input" className="block text-sm font-semibold text-slate-700 mb-3">
                Transcript URL or Text Content
              </label>
              <div className="relative">
                <textarea
                  id="transcript-input"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter your transcript URL or paste transcript text here..."
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200 text-slate-700 placeholder-slate-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-1" />
                Advanced Options
              </button>

              <button
                type="submit"
                disabled={!userInput.trim() || isLoading}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Process Transcript
                  </>
                )}
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Output Template
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>Standard Summary</option>
                      <option>Detailed Notes</option>
                      <option>Action Items</option>
                      <option>Executive Brief</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Custom Rules
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Focus on technical details"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Response Display */}
        {response && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                {response.success ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <h2 className="text-xl font-semibold text-slate-800">Processed Transcript</h2>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                    <h2 className="text-xl font-semibold text-slate-800">Processing Error</h2>
                  </>
                )}
                </div>
                
                {response.success && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 font-medium text-sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Content
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-8">
              {response.success ? (
                <div 
                  className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-hr:border-slate-300"
                  dangerouslySetInnerHTML={{ 
                    __html: formatHTMLContent(response.content) 
                  }}
                />
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">Error Details:</p>
                  <p className="text-red-700 mt-1">{response.error}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Please check your input and try again. Make sure the API endpoint is accessible.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500">
          <p>Powered by intelligent transcript processing • Built for maximum productivity</p>
        </div>
      </div>
    </div>
  );
}

export default App; 