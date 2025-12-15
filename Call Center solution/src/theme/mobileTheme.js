/**
 * Mobile-First Theme Configuration
 * Optimized for field agents using the app on mobile devices
 */

export const mobileStyles = {
  // Minimum touch target sizes (48x48px for accessibility)
  touchTarget: {
    minHeight: 48,
    minWidth: 48,
  },

  // Card styles optimized for mobile
  card: {
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: { xs: 2, sm: 3 },
  },

  // Button styles with better touch targets
  button: {
    primary: {
      minHeight: 48,
      borderRadius: '12px',
      fontWeight: 600,
      fontSize: { xs: '0.9375rem', sm: '1rem' },
      textTransform: 'none',
      py: { xs: 1.5, sm: 2 },
      px: { xs: 2.5, sm: 3 },
    },
    secondary: {
      minHeight: 44,
      borderRadius: '10px',
      fontWeight: 600,
      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
      textTransform: 'none',
      py: { xs: 1.25, sm: 1.5 },
      px: { xs: 2, sm: 2.5 },
    },
    icon: {
      minHeight: 48,
      minWidth: 48,
      borderRadius: '12px',
    },
  },

  // Input styles for easier mobile interaction
  input: {
    root: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        minHeight: 52,
        fontSize: { xs: '1rem', sm: '1rem' },
      },
      '& .MuiInputLabel-root': {
        fontSize: { xs: '0.9375rem', sm: '1rem' },
      },
      '& .MuiOutlinedInput-input': {
        padding: { xs: '14px 16px', sm: '16px' },
      },
    },
  },

  // Tab styles for mobile
  tabs: {
    scrollable: {
      '& .MuiTabs-scrollButtons': {
        width: 40,
        '&.Mui-disabled': {
          opacity: 0.3,
        },
      },
      '& .MuiTab-root': {
        minHeight: 56,
        minWidth: { xs: 80, sm: 120 },
        fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
        fontWeight: 600,
        textTransform: 'none',
        px: { xs: 1.5, sm: 2 },
      },
    },
    bottom: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      bgcolor: 'white',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      zIndex: 1000,
      '& .MuiTab-root': {
        minHeight: 64,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'none',
      },
    },
  },

  // Stepper styles for mobile
  stepper: {
    mobile: {
      '& .MuiStepLabel-root': {
        flexDirection: 'column',
        '& .MuiStepLabel-iconContainer': {
          paddingBottom: 1,
        },
      },
      '& .MuiStepLabel-label': {
        fontSize: '0.6875rem',
        marginTop: 0.5,
        textAlign: 'center',
      },
      '& .MuiStepConnector-line': {
        minHeight: 8,
      },
    },
  },

  // Alert styles
  alert: {
    root: {
      borderRadius: '12px',
      py: { xs: 1.5, sm: 2 },
      px: { xs: 2, sm: 2.5 },
      '& .MuiAlert-message': {
        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
      },
    },
  },

  // Typography scale for mobile
  typography: {
    h1: { fontSize: { xs: '1.75rem', sm: '2.5rem' }, fontWeight: 700 },
    h2: { fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 },
    h3: { fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontWeight: 700 },
    h4: { fontSize: { xs: '1.125rem', sm: '1.5rem' }, fontWeight: 700 },
    h5: { fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600 },
    h6: { fontSize: { xs: '0.9375rem', sm: '1.125rem' }, fontWeight: 600 },
    body1: { fontSize: { xs: '0.9375rem', sm: '1rem' } },
    body2: { fontSize: { xs: '0.8125rem', sm: '0.875rem' } },
    caption: { fontSize: { xs: '0.6875rem', sm: '0.75rem' } },
  },

  // Spacing scale
  spacing: {
    containerPadding: { xs: 2, sm: 3, md: 4 },
    sectionGap: { xs: 2, sm: 3 },
    itemGap: { xs: 1.5, sm: 2 },
  },

  // Colors
  colors: {
    primary: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      main: '#667eea',
      dark: '#5a67d8',
    },
    success: {
      gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
      main: '#22c55e',
      dark: '#16a34a',
    },
    error: {
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      main: '#ef4444',
      dark: '#dc2626',
    },
    warning: {
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      main: '#f59e0b',
      dark: '#d97706',
    },
    info: {
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      main: '#3b82f6',
      dark: '#2563eb',
    },
  },

  // Status chip colors
  statusChips: {
    active: { bgcolor: '#22c55e', color: 'white' },
    inactive: { bgcolor: 'rgba(255,255,255,0.2)', color: 'white' },
    pending: { bgcolor: '#f59e0b', color: 'white' },
    completed: { bgcolor: '#3b82f6', color: 'white' },
    error: { bgcolor: '#ef4444', color: 'white' },
  },

  // Floating Action Button styles
  fab: {
    main: {
      position: 'fixed',
      bottom: { xs: 80, sm: 24 },
      right: { xs: 16, sm: 24 },
      width: 56,
      height: 56,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    },
  },
};

// Helper function to apply mobile-optimized button styles
export const getMobileButtonSx = (variant = 'primary') => ({
  ...mobileStyles.button[variant],
});

// Helper function to apply mobile-optimized input styles
export const getMobileInputSx = () => ({
  ...mobileStyles.input.root,
});

// Helper to check if device is mobile
export const isMobileDevice = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 600 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return false;
};

// Hook-friendly responsive breakpoint values
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export default mobileStyles;
