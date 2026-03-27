import React from 'react';

class PublicErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('PublicErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                    backgroundColor: '#f5f5f5'
                }}>
                    <div style={{
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '40px 24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                        <h2 style={{ margin: '0 0 8px', color: '#333', fontSize: '1.3rem' }}>
                            Algo deu errado
                        </h2>
                        <p style={{ margin: '0 0 24px', color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            Ocorreu um erro inesperado. Por favor, tente novamente.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '12px 32px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Recarregar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default PublicErrorBoundary;
