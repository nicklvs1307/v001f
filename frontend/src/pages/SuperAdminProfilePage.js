import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Container, Typography, Paper, TextField, Button, Avatar,
    Divider, Alert, Snackbar, CircularProgress, Grid, useTheme
} from '@mui/material';
import { Lock, Person, Save, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import userManagementService from '../services/userManagementService';

const ProfilePage = () => {
    const { user } = useAuth();
    const theme = useTheme();
    
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePasswordChange = (e) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSaveProfile = async () => {
        if (!profileData.name || !profileData.email) {
            setSnackbar({ open: true, message: 'Preencha todos os campos', severity: 'error' });
            return;
        }
        
        setLoading(true);
        try {
            await userManagementService.updateSuperAdminUser(user.id, profileData);
            setSnackbar({ open: true, message: 'Perfil atualizado com sucesso!', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao atualizar perfil', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setSnackbar({ open: true, message: 'Preencha todos os campos de senha', severity: 'error' });
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setSnackbar({ open: true, message: 'As senhas não conferem', severity: 'error' });
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setSnackbar({ open: true, message: 'A senha deve ter pelo menos 6 caracteres', severity: 'error' });
            return;
        }
        
        setLoading(true);
        try {
            await userManagementService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSnackbar({ open: true, message: 'Senha alterada com sucesso!', severity: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao alterar senha', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Meu Perfil
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <Avatar 
                            sx={{ 
                                width: 120, 
                                height: 120, 
                                mx: 'auto', 
                                mb: 2,
                                bgcolor: theme.palette.primary.main,
                                fontSize: '3rem'
                            }}
                        >
                            {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {profileData.name || 'Super Admin'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {profileData.email || user?.email}
                        </Typography>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="caption" color="text.secondary">
                            Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </Typography>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Person sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="h6">Informações Pessoais</Typography>
                        </Box>
                        
                        <TextField
                            fullWidth
                            label="Nome Completo"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            sx={{ mb: 3 }}
                        />
                        
                        <Button 
                            variant="contained" 
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            onClick={handleSaveProfile}
                            disabled={loading}
                        >
                            Salvar Informações
                        </Button>
                    </Paper>
                    
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Lock sx={{ mr: 2, color: 'secondary.main' }} />
                            <Typography variant="h6">Alterar Senha</Typography>
                        </Box>
                        
                        <TextField
                            fullWidth
                            label="Senha Atual"
                            name="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={() => togglePasswordVisibility('current')} edge="end">
                                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                )
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Nova Senha"
                            name="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={() => togglePasswordVisibility('new')} edge="end">
                                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                )
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirmar Nova Senha"
                            name="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            sx={{ mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={() => togglePasswordVisibility('confirm')} edge="end">
                                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                )
                            }}
                        />
                        
                        <Button 
                            variant="contained" 
                            color="secondary"
                            startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                            onClick={handleChangePassword}
                            disabled={loading}
                        >
                            Alterar Senha
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
            
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfilePage;
