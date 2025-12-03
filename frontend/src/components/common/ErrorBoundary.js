import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <Typography>Ocorreu um erro ao renderizar o componente: {this.props.name || 'Chart'}.</Typography>
          <Typography variant="caption">{this.state.error?.toString()}</Typography>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
