import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import publicSurveyService from '../services/publicSurveyService';
import { useTheme } from '@mui/material/styles'; // Importar useTheme

// Função utilitária para validar o formato UUID
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

const PublicSurveyPage = () => {
    const { tenantId, pesquisaId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme(); // Usar o hook useTheme

    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [hoverRatings, setHoverRatings] = useState({});
    const [atendentes, setAtendentes] = useState([]);
    const [selectedAtendente, setSelectedAtendente] = useState('');
    const [localTenantId, setLocalTenantId] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null); // Adicionar estado para logoUrl

    useEffect(() => {
        const fetchSurveyAndAtendentes = async () => {
            if (!pesquisaId) {
                setError('ID da pesquisa não fornecido na URL.');
                setLoading(false);
                return;
            }
            // Nova validação para o formato UUID
            if (!isValidUUID(pesquisaId)) {
                setError('Formato de ID da pesquisa inválido na URL.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await publicSurveyService.getPublicSurveyById(pesquisaId);
                setSurvey(data);
                setLocalTenantId(data.tenantId); // Armazenar o tenantId aqui
                setLogoUrl(data.restaurantLogoUrl); // Armazenar a logoUrl aqui

                if (data.askForAttendant) {
                    const atendentesList = await publicSurveyService.getPublicAtendentes(data.tenantId);
                    setAtendentes(atendentesList);
                }

                const initialAnswers = {};
                data.questions.forEach(p => {
                    initialAnswers[p.id] = {
                        perguntaId: p.id,
                        tipo: p.type,
                        valor: null,
                        comentario: ''
                    };
                });
                setAnswers(initialAnswers);
            } catch (err) {
                setError(err.message || 'Ocorreu um erro ao carregar a pesquisa.');
            } finally {
                setLoading(false);
            }
        };
        fetchSurveyAndAtendentes();
    }, [pesquisaId]);

    const displayedQuestions = useMemo(() => {
        if (!survey) return [];
        const questions = [...survey.questions];
        if (survey.askForAttendant) {
            questions.push({
                id: 'attendant-question',
                text: 'Qual atendente realizou o seu atendimento?',
                type: 'attendant_selection',
            });
        }
        return questions;
    }, [survey]);

    const currentQuestion = useMemo(() => {
        return displayedQuestions[currentQuestionIndex];
    }, [displayedQuestions, currentQuestionIndex]);

    const progress = useMemo(() => {
        if (!displayedQuestions.length) return 0;
        return ((currentQuestionIndex + 1) / displayedQuestions.length) * 100;
    }, [displayedQuestions, currentQuestionIndex]);

    const handleAnswerChange = (perguntaId, valueOrEvent) => {
        const value = valueOrEvent.target ? valueOrEvent.target.value : valueOrEvent;
        setAnswers(prev => ({
            ...prev,
            [perguntaId]: { ...prev[perguntaId], valor: value }
        }));
    };

    const handleCommentChange = (perguntaId, comment) => {
        setAnswers(prev => ({
            ...prev,
            [perguntaId]: { ...prev[perguntaId], comentario: comment }
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < displayedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const finalAnswers = Object.values(answers).filter(a => a.perguntaId !== 'attendant-question');
            const submissionData = {
                respostas: finalAnswers,
                atendenteId: selectedAtendente
            };
            const response = await publicSurveyService.submitSurveyResponses(pesquisaId, submissionData.respostas, submissionData.atendenteId);
            
            const storedPhone = localStorage.getItem('clientPhone');
            const surveyState = {
                respondentSessionId: response.respondentSessionId,
                answers: finalAnswers,
                tenantId: localTenantId, // Usar o estado local
                atendenteId: selectedAtendente
            };
            sessionStorage.setItem('surveyState', JSON.stringify(surveyState));

            if (storedPhone) {
                // Se o cliente já é conhecido, vai para a página de confirmação
                navigate(`/confirmar-cliente/${pesquisaId}`);
            } else {
                // Se não, vai para a página de identificação/cadastro
                navigate(`/identificacao-pesquisa/${localTenantId}/${pesquisaId}`);
            }

        } catch (err) {
            setError(err.message || 'Ocorreu um erro ao enviar suas respostas.');
            setLoading(false);
        }
    };

    const renderQuestionType = (question) => {
        const answer = answers[question.id];

        switch (question.type) {
            case 'attendant_selection':
                return (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="atendente-select-label">Selecione o Atendente</InputLabel>
                        <Select
                            labelId="atendente-select-label"
                            value={selectedAtendente}
                            label="Selecione o Atendente"
                            onChange={(e) => setSelectedAtendente(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Não me lembro</em>
                            </MenuItem>
                            {atendentes.map((atendente) => (
                                <MenuItem key={atendente.id} value={atendente.id}>
                                    {atendente.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'rating_1_5':
            case 'rating_0_10':
                if (!answer) return null;
                const maxRating = question.type === 'rating_1_5' ? 5 : 10;
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 2, flexWrap: 'wrap' }}>
                            {[...Array(maxRating)].map((_, i) => {
                                const value = i + 1;
                                return (
                                    <IconButton
                                        key={value}
                                        onClick={() => handleAnswerChange(question.id, value)}
                                        onMouseEnter={() => setHoverRatings({ ...hoverRatings, [question.id]: value })}
                                        onMouseLeave={() => setHoverRatings({ ...hoverRatings, [question.id]: 0 })}
                                        sx={{
                                            color: (hoverRatings[question.id] || answer.valor) >= value ? '#ffc107' : '#ddd',
                                            transform: (hoverRatings[question.id] || answer.valor) === value ? 'scale(1.2)' : 'scale(1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {(hoverRatings[question.id] || answer.valor) >= value ? <Star sx={{ fontSize: { xs: '32px', sm: '40px', md: '48px' } }} /> : <StarBorder sx={{ fontSize: { xs: '32px', sm: '40px', md: '48px' } }} />}
                                    </IconButton>
                                );
                            })}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#777' }}>
                            <span>{question.criterio?.minLabel || 'Pouco Provável'}</span>
                            <span>{question.criterio?.maxLabel || 'Muito Provável'}</span>
                        </Box>
                    </Box>
                );
            case 'free_text':
                if (!answer) return null;
                return (
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Sua resposta..."
                        value={answer.valor || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        sx={{ mt: 2 }}
                    />
                );
            case 'multiple_choice':
                if (!answer) return null;
                return (
                    <RadioGroup
                        value={answer.valor || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        {question.options.map((opcao, index) => {
                            const optionValue = typeof opcao === 'object' && opcao !== null ? opcao.text : opcao;
                            const optionLabel = typeof opcao === 'object' && opcao !== null ? opcao.text : opcao;
                            return (
                                <FormControlLabel
                                    key={index}
                                    value={String(optionValue)} // Garante que o valor seja uma string
                                    control={<Radio />}
                                    label={optionLabel}
                                />
                            );
                        })}
                    </RadioGroup>
                );
            default:
                return <Typography>Tipo de pergunta não suportado.</Typography>;
        }
    };

    if (loading && !survey) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const headerStyle = {
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        color: 'white'
    };

    const buttonNextStyle = {
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        borderRadius: '50px',
        padding: '12px 25px',
        fontWeight: 600,
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
        }
    };

    return (
        <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2
        }}>
            <Container maxWidth="md">
                <Paper elevation={10} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Box sx={headerStyle}>
                        <Box sx={{
                            width: { xs: 80, sm: 100, md: 120 }, 
                            height: { xs: 80, sm: 100, md: 120 }, 
                            borderRadius: '50%', backgroundColor: 'white',
                            margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', border: '5px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: theme.palette.primary.main }}>
                                    LOGO
                                </Typography>
                            )}
                        </Box>
                        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>{survey?.title || 'Pesquisa de Satisfação'}</Typography>
                        <Typography>{survey?.description || 'Sua opinião é muito importante para nós'}</Typography>
                    </Box>

                    <Box sx={{ p: 4 }}>
                        
                            <>
                                <Box sx={{ height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{
                                        height: '100%',
                                        width: `${progress}%`,
                                        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                                        transition: 'width 0.5s ease'
                                    }} />
                                </Box>

                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                        {currentQuestion?.text}
                                    </Typography>
                                    {currentQuestion && renderQuestionType(currentQuestion)}
                                    {(currentQuestion?.type === 'rating_1_5' || currentQuestion?.type === 'rating_0_10') && (
                                        <TextField
                                            fullWidth
                                            label="Comentários adicionais (opcional)"
                                            multiline
                                            rows={3}
                                            value={answers[currentQuestion.id]?.comentario || ''}
                                            onChange={(e) => handleCommentChange(currentQuestion.id, e.target.value)}
                                            sx={{ mt: 3 }}
                                        />
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mt: 4, gap: { xs: 2, sm: 0 } }}>
                                    <Button
                                        onClick={handlePrev}
                                        disabled={currentQuestionIndex === 0}
                                        sx={{
                                            backgroundColor: '#f0f0f0', color: '#555', borderRadius: '50px',
                                            padding: '12px 25px', fontWeight: 600, '&:hover': { backgroundColor: '#e0e0e0' }
                                        }}
                                    >
                                        Anterior
                                    </Button>
                                    {currentQuestionIndex === displayedQuestions.length - 1 ? (
                                        <Button onClick={handleSubmit} disabled={loading} sx={buttonNextStyle}>
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Avaliação'}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleNext} sx={buttonNextStyle}>
                                            Próxima
                                        </Button>
                                    )}
                                </Box>
                            </>
                        
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PublicSurveyPage;