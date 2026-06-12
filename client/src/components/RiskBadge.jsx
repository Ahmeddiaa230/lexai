import React from 'react';

// Risk color map
const RISK_COLORS = {
  low:    '#22C55E',
  medium: '#F59E0B',
  high:   '#EF4444',
};

export default function RiskBadge({ level }) {
  const normalized = (level || 'low').toLowerCase();
  const color = RISK_COLORS[normalized] || RISK_COLORS.low;

  // Convert hex to rgba at 10% opacity
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <span style={{
      display:         'inline-flex',
      alignItems:      'center',
      gap:             '6px',
      backgroundColor: hexToRgba(color, 0.10),
      color:           color,
      fontSize:        '12px',
      fontWeight:      '500',
      fontFamily:      "'Inter', sans-serif",
      padding:         '4px 10px',
      borderRadius:    '999px',
      lineHeight:      '1',
      whiteSpace:      'nowrap',
    }}>
      <span style={{
        width:           '6px',
        height:          '6px',
        borderRadius:    '50%',
        backgroundColor: color,
        flexShrink:      0,
      }} />
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)} Risk
    </span>
  );
}
