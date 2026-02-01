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
    FormHelperText, // Adicionado FormHelperText
    Dialog,
    DialogContent,
    DialogTitle,
    Slide,
    DialogActions,
    Fade,
    Grow,
} from '@mui/material';
import { Star, StarBorder, CheckCircle } from '@mui/icons-material';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';

const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

// Componente Wrapper para carregar dados e tema
const PublicSurveyPage = () => {
    const { tenantId, pesquisaId } = useParams();
    const [surveyData, setSurveyData] = useState(null);
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pesquisaId || !isValidUUID(pesquisaId)) {
            setError('ID da pesquisa inválido ou não fornecido.');
            setLoading(false);
            return;
        }

        publicSurveyService.getPublicSurveyById(pesquisaId)
            .then(data => {
                setSurveyData(data);
                const theme = getDynamicTheme({ primaryColor: data.primaryColor, secondaryColor: data.secondaryColor });
                setDynamicTheme(theme);
            })
            .catch(err => setError(err.message || 'Ocorreu um erro ao carregar a pesquisa.'))
            .finally(() => setLoading(false));
    }, [pesquisaId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Alert severity="error">{error}</Alert></Box>;
    }

    if (!surveyData || !dynamicTheme) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Typography>Carregando tema...</Typography></Box>;
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            <SurveyComponent survey={surveyData} tenantId={tenantId} />
        </ThemeProvider>
    );
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Componente de UI que usa o tema fornecido
const SurveyComponent = ({ survey, tenantId }) => {
    const { pesquisaId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme(); // Agora usa o tema do ThemeProvider acima

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [hoverRatings, setHoverRatings] = useState({});
    const [atendentes, setAtendentes] = useState([]);
    const [selectedAtendente, setSelectedAtendente] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [atendenteError, setAtendenteError] = useState(null); // Added attendant error state
    const [gmbModalOpen, setGmbModalOpen] = useState(false);
    const [gmbLink, setGmbLink] = useState('');
    const [submissionResponse, setSubmissionResponse] = useState(null);

    useEffect(() => {
        const initialAnswers = {};
        (survey.questions || []).forEach(p => {
            initialAnswers[p.id] = { perguntaId: p.id, tipo: p.type, valor: null, comentario: '' };
        });
        setAnswers(initialAnswers);

        if (survey.askForAttendant) {
            publicSurveyService.getPublicAtendentes(tenantId)
                .then(setAtendentes)
                .catch(() => setSubmitError('Erro ao carregar atendentes.'));
        }
    }, [survey, tenantId]);

    const displayedQuestions = useMemo(() => {
        if (!survey) return [];
        const questions = [...(survey.questions || [])];
        if (survey.askForAttendant) {
            questions.push({
                id: 'attendant-question',
                text: 'Qual atendente realizou o seu atendimento?',
                type: 'attendant_selection',
            });
        }
        return questions;
    }, [survey]);

    const currentQuestion = useMemo(() => displayedQuestions[currentQuestionIndex], [displayedQuestions, currentQuestionIndex]);
    const progress = useMemo(() => displayedQuestions.length ? ((currentQuestionIndex + 1) / displayedQuestions.length) * 100 : 0, [displayedQuestions, currentQuestionIndex]);

    const handleAnswerChange = (perguntaId, valueOrEvent) => {
        const value = valueOrEvent.target ? valueOrEvent.target.value : valueOrEvent;
        setAnswers(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], valor: value } }));
    };

    const handleCommentChange = (perguntaId, comment) => {
        setAnswers(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], comentario: comment } }));
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

    const handleNavigation = (response) => {
        const storedPhone = localStorage.getItem('clientPhone');
        const surveyState = { respondentSessionId: response.respondentSessionId, answers: Object.values(answers).filter(a => a.perguntaId !== 'attendant-question' && a.valor !== null), tenantId: tenantId, atendenteId: selectedAtendente };
        sessionStorage.setItem('surveyState', JSON.stringify(surveyState));

        if (storedPhone) {
            navigate(`/confirmar-cliente/${pesquisaId}`);
        } else {
            navigate(`/identificacao-pesquisa/${tenantId}/${pesquisaId}`);
        }
    };

    const handleSubmit = async () => {
        setSubmitLoading(true);
        setSubmitError(null);
        setAtendenteError(null);

        if (survey.askForAttendant && !selectedAtendente) {
            setAtendenteError('O nome do atendente é obrigatório.');
            setSubmitLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll para erro
            return;
        }

        try {
            const finalAnswers = Object.values(answers).filter(a => a.perguntaId !== 'attendant-question' && a.valor !== null);
            const submissionData = { respostas: finalAnswers, atendenteId: selectedAtendente };
            const response = await publicSurveyService.submitSurveyResponses(pesquisaId, submissionData.respostas, submissionData.atendenteId);
            setSubmissionResponse(response); // Salva a resposta completa no estado

            if (response && response.gmb_link) {
                setGmbLink(response.gmb_link);
                setGmbModalOpen(true);
                // A navegação ocorrerá após o fechamento do modal
            } else {
                handleNavigation(response);
            }
        } catch (err) {
            console.error("Erro no envio:", err);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll para erro
            
            if (err.response && err.response.data && err.response.data.errors && Array.isArray(err.response.data.errors)) {
                const attendantBackendError = err.response.data.errors.find(e => e.msg === 'O nome do atendente é obrigatório.');
                if (attendantBackendError) {
                    setAtendenteError(attendantBackendError.msg);
                } else {
                    setSubmitError(err.response.data.errors.map(e => e.msg).join(', ') || 'Ocorreu um erro de validação.');
                }
            } else if (err.code === 'ECONNABORTED') {
                 setSubmitError('A conexão demorou muito. Verifique sua internet e tente novamente.');
            } else {
                setSubmitError(err.message || 'Ocorreu um erro ao enviar suas respostas. Verifique sua conexão.');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const renderQuestionType = (question) => {
        const answer = answers[question.id];
        // Proteção contra undefined, embora a lógica de display já filtre
        if ((!answer && question.type !== 'attendant_selection') || !question) return null;

        switch (question.type) {
            case 'attendant_selection':
                return (
                    <FormControl fullWidth sx={{ mt: 2 }} error={!!atendenteError}>
                        <InputLabel id="atendente-select-label">Selecione o Atendente</InputLabel>
                        <Select
                            labelId="atendente-select-label"
                            value={selectedAtendente}
                            label="Selecione o Atendente"
                            onChange={(e) => {
                                setSelectedAtendente(e.target.value);
                                setAtendenteError(null); 
                            }}
                        >
                            <MenuItem value=""><em>Não me lembro</em></MenuItem>
                            {atendentes.map((atendente) => <MenuItem key={atendente.id} value={atendente.id}>{atendente.name}</MenuItem>)}
                        </Select>
                        {atendenteError && <FormHelperText>{atendenteError}</FormHelperText>}
                    </FormControl>
                );
            case 'rating_1_5':
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 2, flexWrap: 'wrap' }}>
                            {[...Array(6).keys()].slice(1).map(value => ( 
                                <Grow in={true} timeout={value * 200} key={value}>
                                    <IconButton 
                                        onClick={() => handleAnswerChange(question.id, value)} 
                                        sx={{ 
                                            color: (answer.valor) >= value ? '#ffc107' : '#e0e0e0', 
                                            transform: (answer.valor) === value ? 'scale(1.3)' : 'scale(1)', 
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Efeito de mola
                                            '&:active': { transform: 'scale(0.9)' }
                                        }}
                                    >
                                        {(answer.valor) >= value ? <Star sx={{ fontSize: { xs: '38px', sm: '48px' }, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} /> : <StarBorder sx={{ fontSize: { xs: '38px', sm: '48px' } }} />}
                                    </IconButton>
                                </Grow>
                            ))}
                        </Box>
                        <Box sx={{ width: '100%', textAlign: 'center', fontSize: '12px', color: '#777', mt: 1 }}>
                            <span>Toque nas estrelas para avaliar</span>
                        </Box>
                    </Box>
                );
            case 'rating_0_10':
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 0.5, sm: 1 }, my: 3, flexWrap: 'wrap' }}>
                            {[...Array(11).keys()].map((value, index) => ( 
                                <Grow in={true} timeout={index * 100} key={value}>
                                    <Box
                                        onClick={() => handleAnswerChange(question.id, value)}
                                        sx={{
                                            width: { xs: 35, sm: 45 },
                                            height: { xs: 35, sm: 45 },
                                            borderRadius: '12px', // Quadrado arredondado é mais moderno que círculo
                                            border: `2px solid ${(answer.valor) === value ? theme.palette.primary.main : '#e0e0e0'}`,
                                            backgroundColor: (answer.valor) === value ? theme.palette.primary.main : 'transparent',
                                            color: (answer.valor) === value ? 'white' : theme.palette.text.secondary,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: (answer.valor) === value ? '0 4px 10px rgba(0,0,0,0.2)' : 'none',
                                            transform: (answer.valor) === value ? 'translateY(-5px)' : 'none',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }}
                                    >
                                        {value}
                                    </Box>
                                </Grow>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#777', px: 1 }}>
                            <span>{question.criterio?.minLabel || 'Pouco Provável'}</span>
                            <span>{question.criterio?.maxLabel || 'Muito Provável'}</span>
                        </Box>
                    </Box>
                );
            case 'free_text':
                return <TextField fullWidth multiline rows={4} variant="outlined" placeholder="Digite sua resposta aqui..." value={answer.valor || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)} sx={{ mt: 2, backgroundColor: '#f9f9f9', borderRadius: '10px', '& fieldset': { borderRadius: '10px' } }} />;
            case 'multiple_choice':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                        {(question.options || []).map((opcao, index) => {
                            const isSelected = String(answer.valor) === String(opcao.text);
                            return (
                                <Box
                                    key={index}
                                    onClick={() => handleAnswerChange(question.id, String(opcao.text))}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '15px 20px',
                                        borderRadius: '15px',
                                        border: `2px solid ${isSelected ? theme.palette.primary.main : '#eee'}`,
                                        backgroundColor: isSelected ? `${theme.palette.primary.main}15` : 'white', // 15 = transparência hex
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.05)',
                                        '&:hover': {
                                            borderColor: theme.palette.primary.light,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <Typography sx={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? theme.palette.primary.dark : 'text.primary' }}>
                                        {opcao.text}
                                    </Typography>
                                    <Box sx={{ 
                                        width: 24, height: 24, borderRadius: '50%', 
                                        border: `2px solid ${isSelected ? theme.palette.primary.main : '#ccc'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: isSelected ? theme.palette.primary.main : 'transparent'
                                    }}>
                                        {isSelected && <CheckCircle sx={{ color: 'white', fontSize: 20 }} />}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                );
            default:
                return <Typography>Tipo de pergunta não suportado.</Typography>;
        }
    };

    const headerStyle = { background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, padding: { xs: '20px', sm: '30px' }, textAlign: 'center', position: 'relative', color: 'white' };
    const buttonNextStyle = { background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, color: 'white', borderRadius: '50px', padding: '12px 25px', fontWeight: 600, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' } };

    return (
        <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: { xs: 1, sm: 2 } }}>
            <Container maxWidth="md">
                <Paper elevation={10} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Box sx={headerStyle}>
                        <Box sx={{ width: { xs: 80, sm: 120 }, height: { xs: 80, sm: 120 }, borderRadius: '50%', backgroundColor: 'white', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', border: '5px solid rgba(255, 255, 255, 0.3)' }}>
                            {survey.restaurantLogoUrl ? <img src={`${process.env.REACT_APP_API_URL}${survey.restaurantLogoUrl}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: theme.palette.primary.main }}>LOGO</Typography>}
                        </Box>
                        <Typography variant="h4" component="h1" sx={{ mb: 1, fontSize: { xs: '1.7rem', sm: '2.5rem' } }}>{survey?.title || 'Pesquisa de Satisfação'}</Typography>
                        <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{survey?.description || 'Sua opinião é muito importante para nós'}</Typography>
                    </Box>
                    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                        <>
                        {/* Progress Bar */}
                        <Box sx={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '10px', mb: 4, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                            <Box sx={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '10px' }} />
                        </Box>

                        <Fade in={true} key={currentQuestionIndex} timeout={500}>
                            <Box>
                                <Typography variant="h6" sx={{ mb: 3, color: '#222', fontSize: { xs: '1.1rem', sm: '1.4rem' }, fontWeight: 600, lineHeight: 1.3 }}>{currentQuestion?.text}</Typography>
                                
                                {currentQuestion && renderQuestionType(currentQuestion)}
                                
                                {(currentQuestion?.type === 'rating_1_5' || currentQuestion?.type === 'rating_0_10') && <TextField fullWidth label="Gostaria de comentar algo? (Opcional)" multiline rows={2} value={answers[currentQuestion.id]?.comentario || ''} onChange={(e) => handleCommentChange(currentQuestion.id, e.target.value)} sx={{ mt: 4, backgroundColor: '#fcfcfc' }} variant="filled" />}
                            </Box>
                        </Fade>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', mt: 5, gap: { xs: 2, sm: 0 }, paddingTop: 3, borderTop: '1px solid #f0f0f0' }}>
                                <Button onClick={handlePrev} disabled={currentQuestionIndex === 0} sx={{ backgroundColor: '#f0f0f0', color: '#555', borderRadius: '50px', padding: '12px 25px', fontWeight: 600, '&:hover': { backgroundColor: '#e0e0e0' } }}>Anterior</Button>
                                {currentQuestionIndex === displayedQuestions.length - 1 ? <Button onClick={handleSubmit} disabled={submitLoading} sx={buttonNextStyle}>{submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Avaliação'}</Button> : <Button onClick={handleNext} sx={buttonNextStyle}>Próxima</Button>}
                            </Box>
                        </>
                    </Box>
                </Paper>
            </Container>
            <Dialog
                open={gmbModalOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => {
                    setGmbModalOpen(false);
                    handleNavigation(submissionResponse);
                }}
                aria-describedby="gmb-review-dialog-slide-description"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{"Sua opinião é muito importante!"}</DialogTitle>
                <DialogContent>
                    <Typography>Para nos ajudar a melhorar ainda mais, por favor, deixe uma avaliação no Google. Você será redirecionado para a página de avaliação.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setGmbModalOpen(false);
                        handleNavigation(submissionResponse);
                    }}>Pular</Button>
                    <Button onClick={() => {
                        window.open(gmbLink, '_blank');
                        setGmbModalOpen(false);
                        handleNavigation(submissionResponse);
                    }} autoFocus>Avaliar Agora</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PublicSurveyPage;