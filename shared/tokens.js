/**
 * Design token defaults and size density presets.
 * Used by the Theme Provider to compute CSS variables.
 */

export const TOKEN_DEFAULTS = {
  '--pv-primary': '#3B82F6',
  '--pv-primary-hover': '#1e40af',
  '--pv-primary-light': '#dbeafe',
  '--pv-primary-contrast': '#ffffff',
  '--pv-danger': '#EF4444',
  '--pv-success': '#22C55E',
  '--pv-warning': '#F59E0B',
  '--pv-neutral': '#64748b',
  '--pv-surface': '#f8fafc',
  '--pv-border': '#e2e8f0',
  '--pv-text': '#0f172a',
  '--pv-text-muted': '#94a3b8',
  '--pv-radius-sm': '4px',
  '--pv-radius': '8px',
  '--pv-radius-lg': '12px',
  '--pv-radius-full': '9999px',
  '--pv-transition': '150ms',
  '--pv-font': 'Inter, system-ui, sans-serif',
  '--pv-font-size-lg': '16px',
  '--pv-shadow-sm': '0 1px 3px rgba(0,0,0,0.1)',
  '--pv-shadow': '0 4px 12px rgba(0,0,0,0.1)',
  '--pv-focus-ring': 'rgba(59,130,246,0.3)',
};

export const SIZE_PRESETS = {
  sm: {
    '--pv-spacing': '4px',
    '--pv-input-py': '6px',
    '--pv-input-px': '10px',
    '--pv-btn-py': '6px',
    '--pv-btn-px': '12px',
    '--pv-font-size': '13px',
    '--pv-font-size-sm': '11px',
    '--pv-icon-size': '16px',
  },
  md: {
    '--pv-spacing': '8px',
    '--pv-input-py': '10px',
    '--pv-input-px': '14px',
    '--pv-btn-py': '10px',
    '--pv-btn-px': '20px',
    '--pv-font-size': '14px',
    '--pv-font-size-sm': '12px',
    '--pv-icon-size': '18px',
  },
  lg: {
    '--pv-spacing': '12px',
    '--pv-input-py': '14px',
    '--pv-input-px': '18px',
    '--pv-btn-py': '14px',
    '--pv-btn-px': '28px',
    '--pv-font-size': '16px',
    '--pv-font-size-sm': '14px',
    '--pv-icon-size': '20px',
  },
};

export function getTokensForSize(size) {
  if (size === 'custom') return {};
  return SIZE_PRESETS[size] || SIZE_PRESETS.md;
}
