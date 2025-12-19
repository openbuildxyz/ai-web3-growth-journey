import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo || null
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="100vh"
          p={3}
          gap={2}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Oops! Something went wrong
            </Typography>
          </Alert>
          
          <Typography variant="body1" color="text.secondary" textAlign="center">
            The application encountered an unexpected error. Please try reloading the page.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={this.handleReload}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: '80%' }}>
              <Typography variant="subtitle2" color="error">
                Error Details (Development Mode):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
                {this.state.error && this.state.error.toString()}
              </Typography>
              {this.state.errorInfo && (
                <Typography variant="body2" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
                  {this.state.errorInfo.componentStack}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
