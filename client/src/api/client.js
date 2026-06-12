// Read between the lines - LexAI API Client
// Built by NoirBytes

// In production (Vercel), set VITE_API_URL to your Render backend URL
// e.g. VITE_API_URL=https://lexai-backend.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('contract', file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw {
      message: errorData.error || 'Failed to upload PDF',
      status: res.status,
      code: errorData.code || 'UPLOAD_ERROR',
    };
  }

  return res.json();
}

export async function analyzePDF(id) {
  const res = await fetch(`${BASE_URL}/api/analyze/${id}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw {
      message: errorData.error || 'Failed to analyze PDF',
      status: res.status,
      code: errorData.code || 'ANALYZE_ERROR',
    };
  }

  return res.json();
}
