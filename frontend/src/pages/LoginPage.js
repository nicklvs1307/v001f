import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import LoginLayout from '../components/layout/LoginLayout'; // Importar o novo componente de layout

// Importar componentes do Material-UI
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, Link as MuiLink } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useNotification } from '../context/NotificationContext'; // Import useNotification

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const { showNotification } = useNotification(); // Get showNotification

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
            // A navegação agora é controlada pelo AuthContext
        } catch (err) {
            console.error("Falha no login:", err);
            showNotification(err.message || 'Erro desconhecido ao fazer login.', 'error'); // Show error notification
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginLayout>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', color: '#333', fontWeight: 600 }}>
                Fazer Login
            </Typography>
            <Typography variant="body2" paragraph sx={{ textAlign: 'center', color: '#777', mb: 4 }}>
                Entre com suas credenciais para acessar sua conta
            </Typography>
            
            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" component="label" htmlFor="email" sx={{ display: 'block', mb: 1, color: '#555', fontWeight: 500 }}>
                        E-mail
                    </Typography>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <EmailIcon sx={{ color: '#777', mr: 1 }} />
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                paddingLeft: '0px',
                            },
                            '& .MuiInputBase-input': {
                                padding: '15px 15px 15px 0px',
                            },
                        }}
                    />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" component="label" htmlFor="password" sx={{ display: 'block', mb: 1, color: '#555', fontWeight: 500 }}>
                        Senha
                    </Typography>
                    <TextField
                        fullWidth
                        type="password"
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Sua senha"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <LockIcon sx={{ color: '#777', mr: 1 }} />
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                paddingLeft: '0px',
                            },
                            '& .MuiInputBase-input': {
                                padding: '15px 15px 15px 0px',
                            },
                        }}
                    />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, fontSize: '14px' }}>
                    <FormControlLabel
                        control={<Checkbox id="remember" />}
                        label="Lembrar-me"
                        sx={{ '.MuiFormControlLabel-label': { fontSize: '14px', color: '#555' } }}
                    />
                    <MuiLink href="#" variant="body2" sx={{ color: '#6a11cb', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                        Esqueceu a senha?
                    </MuiLink>
                </Box>
                
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                        padding: '15px',
                        background: 'linear-gradient(135deg, #FA4D32 0%, #327DFA 100%)',
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 600,
                        textTransform: 'none',
                        mb: 3,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 5px 15px rgba(250, 77, 50, 0.4)',
                        },
                    }}
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>
        </LoginLayout>
    );
};

export default LoginPage;
