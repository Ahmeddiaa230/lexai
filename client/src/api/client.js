export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('contract', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { 
      message: errorData.error || 'Failed to upload PDF', 
      status: res.status, 
      code: errorData.code || 'UPLOAD_ERROR' 
    };
  }

  return res.json();
}

export async function analyzePDF(id) {
  const res = await fetch(`/api/analyze/${id}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { 
      message: errorData.error || 'Failed to analyze PDF', 
      status: res.status, 
      code: errorData.code || 'ANALYZE_ERROR'
    };
  }

  return res.json();
}
