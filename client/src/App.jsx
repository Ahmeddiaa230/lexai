import React, { useState } from 'react';
import UploadZone from './components/UploadZone';
import AnalysisResult from './components/AnalysisResult';
import { uploadPDF, analyzePDF } from './api/client';

export default function App() {
  const [state, setState] = useState({
    step: 'upload', // 'upload' | 'analyzing' | 'result' | 'error'
    analysisId: null,
    result: null,
    error: null,
  });

  const handleUpload = async (file) => {
    setState({ ...state, step: 'analyzing', error: null });
    try {
      const uploadRes = await uploadPDF(file);
      const analysisRes = await analyzePDF(uploadRes.id);
      setState({
        step: 'result',
        analysisId: uploadRes.id,
        result: analysisRes,
        error: null,
      });
    } catch (err) {
      setState({
        ...state,
        step: 'error',
        error: err.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleReset = () => {
    setState({ step: 'upload', analysisId: null, result: null, error: null });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoContainer}>
            <span style={styles.logoPrefix}>Lex</span>
            <span style={styles.logoSuffix}>AI</span>
          </div>
          <div style={styles.tagline}>Read between the lines.</div>
        </div>
      </header>

      <main style={styles.main}>
        {state.step === 'upload' && <UploadZone onUpload={handleUpload} />}
        
        {state.step === 'analyzing' && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingText}>Analyzing your contract...</div>
          </div>
        )}

        {state.step === 'result' && state.result && (
          <AnalysisResult result={state.result} onReset={handleReset} />
        )}

        {state.step === 'error' && (
          <div style={styles.errorContainer}>
            <div style={styles.errorText}>{state.error}</div>
            <button 
              style={styles.resetButton} 
              onClick={handleReset}
              onMouseOver={(e) => e.target.style.backgroundColor = '#818CF8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366F1'}
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0A0A0F',
    color: '#F1F5F9',
  },
  header: {
    borderBottom: '1px solid #1E1E2E',
    backgroundColor: '#0A0A0F',
    padding: '1.5rem 2rem',
  },
  headerContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'baseline',
    gap: '1.5rem',
  },
  logoContainer: {
    fontSize: '28px',
    fontWeight: '600',
    letterSpacing: '-0.02em',
  },
  logoPrefix: {
    color: '#F1F5F9',
  },
  logoSuffix: {
    color: '#6366F1',
  },
  tagline: {
    color: '#94A3B8',
    fontSize: '15px',
    fontWeight: '400',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4rem 2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '4rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #1E1E2E',
    borderTopColor: '#6366F1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '16px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '4rem',
    padding: '2.5rem',
    backgroundColor: '#111118',
    border: '1px solid #1E1E2E',
    borderRadius: '12px',
    maxWidth: '400px',
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  resetButton: {
    backgroundColor: '#6366F1',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
};

// Global animation for the spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
