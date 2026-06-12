import React, { useState, useRef } from 'react';

export default function UploadZone({ onUpload }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please drop a PDF file.');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please select a PDF file.');
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="application/pdf"
          onChange={handleFileSelect}
        />
        
        <div style={styles.label}>Upload your contract</div>
        <div style={styles.subtext}>PDF files only &middot; Max 10MB</div>

        {selectedFile && (
          <div style={styles.fileInfo}>
            <span style={styles.fileName} title={selectedFile.name}>{selectedFile.name}</span>
            <span style={styles.fileSize}>({formatFileSize(selectedFile.size)})</span>
          </div>
        )}
      </div>

      {selectedFile && (
        <button 
          style={styles.uploadButton} 
          onClick={handleUploadClick}
          onMouseOver={(e) => e.target.style.backgroundColor = '#818CF8'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6366F1'}
        >
          Analyze Contract
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  dropzone: {
    backgroundColor: '#111118',
    border: '2px dashed #1E1E2E',
    borderRadius: '12px',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dropzoneActive: {
    borderColor: '#6366F1',
    backgroundColor: '#1A1A24',
  },
  label: {
    color: '#F1F5F9',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  subtext: {
    color: '#94A3B8',
    fontSize: '13px',
    marginBottom: '1rem',
  },
  fileInfo: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#0A0A0F',
    border: '1px solid #1E1E2E',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    justifyContent: 'center',
  },
  fileName: {
    color: '#F1F5F9',
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '220px',
  },
  fileSize: {
    color: '#94A3B8',
    fontSize: '13px',
  },
  uploadButton: {
    width: '100%',
    backgroundColor: '#6366F1',
    color: '#fff',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }
};
