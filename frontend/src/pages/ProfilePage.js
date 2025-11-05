import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import AuthContext from '../context/AuthContext';
import userService from '../services/userService';

const ProfilePage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePictureUploadLoading, setProfilePictureUploadLoading] = useState(false);
    const [profilePictureUploadSuccess, setProfilePictureUploadSuccess] = useState(false);

    const { showNotification } = useNotification();

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setProfilePictureUrl(user.profilePictureUrl || '');
        }
    }, [user]);

    const handleFileChange = (e) => {
        setProfilePictureFile(e.target.files[0]);
        setProfilePictureUploadSuccess(false);
    };

    const handleProfilePictureUpload = async () => {
        if (!profilePictureFile) {
            showNotification('Por favor, selecione um arquivo para upload.', 'warning');
            return;
        }
        if (!user?.id) {
            showNotification('ID do Usuário não disponível para upload.', 'error');
            return;
        }

        setProfilePictureUploadLoading(true);
        setProfilePictureUploadSuccess(false);

        try {
            const response = await userService.uploadProfilePicture(user.id, profilePictureFile);
            setProfilePictureUrl(response.profilePictureUrl);
            updateUser({ ...user, profilePictureUrl: response.profilePictureUrl });
            setProfilePictureUploadSuccess(true);
            setProfilePictureFile(null);
        } catch (err) {
            showNotification(err.message || 'Erro ao fazer upload da foto de perfil.', 'error');
            console.error('Erro ao fazer upload da foto de perfil:', err);
        } finally {
            setProfilePictureUploadLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const updatedUserData = await userService.updateUser(user.id, {
                name,
                email,
            });

            updateUser({ ...user, ...updatedUserData.user });
            setSuccess(true);
        } catch (err) {
            showNotification(err.message || 'Falha ao atualizar o perfil.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Meu Perfil
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Perfil atualizado com sucesso!
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    {/* Seção de Foto de Perfil */}
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Foto de Perfil</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        src={profilePictureUrl ? `http://localhost:3001${profilePictureUrl}` : '/default-avatar.png'}
                                        alt="Foto de Perfil"
                                        sx={{ width: 120, height: 120, mb: 2, border: '1px solid #ccc' }}
                                    />
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="raised-button-file-profile"
                                        type="file"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                    <label htmlFor="raised-button-file-profile">
                                        <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                                            Selecionar Foto
                                        </Button>
                                    </label>
                                    {profilePictureFile && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>Arquivo selecionado: {profilePictureFile.name}</Typography>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleProfilePictureUpload}
                                        disabled={!user?.id || !profilePictureFile || profilePictureUploadLoading}
                                        sx={{ mt: 2 }}
                                        startIcon={profilePictureUploadLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                                    >
                                        {profilePictureUploadLoading ? 'Enviando...' : 'Fazer Upload da Foto'}
                                    </Button>
                                    {profilePictureUploadSuccess && (
                                        <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                                            Foto de perfil enviada com sucesso!
                                        </Alert>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Seção de Informações do Perfil */}
                    <Grid item xs={12} md={8}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Informações do Perfil</Typography>
                                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="name"
                                        label="Nome"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 3, mb: 2 }}
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                    >
                                        Salvar Alterações
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default ProfilePage;