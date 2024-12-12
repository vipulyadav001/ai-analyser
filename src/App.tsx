import React, { useState } from 'react';
import './App.css';
import { getChatCompletion } from './services/huggingface';
import ReactMarkdown from 'react-markdown';
import { ClipLoader } from 'react-spinners';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [input, setInput] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [canRetry, setCanRetry] = useState(false);

  const TIMEOUT_DURATION = 30000; // 30 seconds

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please enter an idea to analyze');
      return;
    }
    if (input.length > 1000) {
      setError('Please limit your idea to 1000 characters');
      return;
    }
    setError('');
    setIsLoading(true);
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
      );
      
      const result = await Promise.race([
        getChatCompletion(input),
        timeoutPromise
      ]) as { content: string };
      
      if (result?.content) {
        setResponse(result.content);
      } else {
        setError('No response received');
        setCanRetry(true);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError('Error occurred while fetching response');
      }
      setCanRetry(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
      <header className="App-header">
        <h1>AI Idea Analyzer</h1>
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your idea to analyze..."
              rows={4}
              className="idea-input"
              maxLength={1000}
            />
            <div className="char-count">
              {input.length}/1000 characters
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Ask AI'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
        {isLoading && (
          <div className="loading">
            <ClipLoader color="#61dafb" size={50} />
            <div>Analyzing your idea...</div>
          </div>
        )}
        {response && (
          <div className="response-box">
            <div className="response-header">
              <button 
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(response)}
              >
                Copy
              </button>
            </div>
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        )}
        {error && canRetry && (
          <button 
            className="retry-button"
            onClick={() => handleSubmit()}
          >
            Retry Analysis
          </button>
        )}
      </header>
      </div>
    </ErrorBoundary>
  );
}

export default App;
