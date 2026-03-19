import React, { useState, useEffect, useMemo, useCallback, startTransition } from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import { Star, StarBorder, CheckCircle } from '@mui/icons-material';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';

// Estilos críticos em JS para evitar processamento do Emotion no LCP
const CRITICAL_STYLES = {
    container: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
    },
    paper: {
        width: '100%',
        maxWidth: '552px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    header: {
        padding: '32px 16px',
        textAlign: 'center',
        color: '#fff'
    },
    logoContainer: {
        width: '80px',
        height: '80px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        margin: '0 auto 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid rgba(255,255,255,0.3)'
    }
};

const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

// --- Componentes de Pergunta Otimizados ---

const Rating1to5 = React.memo(({ question, answer, onChange }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '16px 0', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map(value => (
                <IconButton 
                    key={value}
                    onClick={() => onChange(question.id, value)} 
                    style={{ 
                        color: (answer?.valor) >= value ? '#ffc107' : '#e0e0e0', 
                        transform: (answer?.valor) === value ? 'scale(1.2)' : 'scale(1)', 
                        transition: 'color 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        padding: '8px'
                    }}
                >
                    {(answer?.valor) >= value ? <Star style={{ fontSize: '40px' }} /> : <StarBorder style={{ fontSize: '40px' }} />}
                </IconButton>
            ))}
        </div>
        <p style={{ fontSize: '12px', textAlign: 'center', color: '#777', margin: 0 }}>
            Toque nas estrelas para avaliar
        </p>
    </div>
));

const Rating0to10 = React.memo(({ question, answer, onChange, theme }) => {
    const values = useMemo(() => [...Array(11).keys()], []);
    const primaryMain = theme.palette.primary.main;
    const textSecondary = theme.palette.text.secondary;

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '24px 0', flexWrap: 'wrap' }}>
                {values.map((value) => {
                    const isSelected = (answer?.valor) === value;
                    return (
                        <div
                            key={value}
                            onClick={() => onChange(question.id, value)}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                border: `2px solid ${isSelected ? primaryMain : '#e0e0e0'}`,
                                backgroundColor: isSelected ? primaryMain : 'transparent',
                                color: isSelected ? 'white' : textSecondary,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', 
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {value}
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#777', padding: '0 8px' }}>
                <span>{question.criterio?.minLabel || 'Pouco Provável'}</span>
                <span>{question.criterio?.maxLabel || 'Muito Provável'}</span>
            </div>
        </div>
    );
});

const MultipleChoice = React.memo(({ question, answer, onChange, theme }) => {
    const primaryMain = theme.palette.primary.main;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {(question.options || []).map((opcao, index) => {
                const isSelected = String(answer?.valor) === String(opcao.text);
                return (
                    <div
                        key={index}
                        onClick={() => onChange(question.id, String(opcao.text))}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 18px', borderRadius: '12px',
                            border: `2px solid ${isSelected ? primaryMain : '#eee'}`,
                            backgroundColor: isSelected ? `${primaryMain}15` : 'white',
                            cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                    >
                        <span style={{ fontWeight: isSelected ? 600 : 400, fontSize: '1rem' }}>{opcao.text}</span>
                        <div style={{ 
                            width: '22px', height: '22px', borderRadius: '50%', 
                            border: `2px solid ${isSelected ? primaryMain : '#ccc'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isSelected ? primaryMain : 'transparent'
                        }}>
                            {isSelected && <CheckCircle style={{ color: 'white', fontSize: '16px' }} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

// --- Componente Principal ---

const PublicSurveyPage = () => {
    const { tenantId, pesquisaId } = useParams();
    const [surveyData, setSurveyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dynamicTheme = useMemo(() => {
        if (!surveyData) return null;
        return getDynamicTheme({ 
            primaryColor: surveyData.primaryColor, 
            secondaryColor: surveyData.secondaryColor 
        });
    }, [surveyData]);

    useEffect(() => {
        if (!pesquisaId || !isValidUUID(pesquisaId)) {
            setError('ID da pesquisa inválido.');
            setLoading(false);
            return;
        }

        publicSurveyService.getPublicSurveyById(pesquisaId)
            .then(setSurveyData)
            .catch(err => {
                setError(err.response?.status === 410 ? 'Link expirado.' : 'Erro ao carregar pesquisa.');
            })
            .finally(() => setLoading(false));
    }, [pesquisaId]);

    // Renderização do esqueleto ultra-rápido para LCP
    if (loading && !surveyData) {
        return (
            <div style={{ ...CRITICAL_STYLES.container, backgroundColor: '#f5f5f5' }}>
                <div style={CRITICAL_STYLES.paper}>
                    <div style={{ ...CRITICAL_STYLES.header, backgroundColor: '#ccc' }}>
                        <div style={CRITICAL_STYLES.logoContainer} />
                        <div style={{ width: '60%', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 auto', borderRadius: '4px' }} />
                    </div>
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                        <CircularProgress size={40} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Alert severity="error">{error}</Alert></Box>;

    return (
        <ThemeProvider theme={dynamicTheme}>
            <SurveyComponent survey={surveyData} tenantId={tenantId} />
        </ThemeProvider>
    );
};

const SurveyComponent = ({ survey, tenantId }) => {
    const { pesquisaId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const [answers, setAnswers] = useState(() => {
        const initial = {};
        (survey.questions || []).forEach(p => {
            initial[p.id] = { perguntaId: p.id, tipo: p.type, valor: null, comentario: '' };
        });
        return initial;
    });

    const [atendentes, setAtendentes] = useState([]);
    const [selectedAtendente, setSelectedAtendente] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [atendenteError, setAtendenteError] = useState(null);
    
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        if (visibleCount < (survey.questions || []).length) {
            const timer = setTimeout(() => {
                setVisibleCount(prev => prev + 5);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [visibleCount, survey.questions]);

    useEffect(() => {
        if (survey.askForAttendant) {
            publicSurveyService.getPublicAtendentes(tenantId).then(setAtendentes).catch(() => {});
        }
    }, [survey.askForAttendant, tenantId]);

    const handleAnswerChange = useCallback((perguntaId, value) => {
        startTransition(() => {
            setAnswers(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], valor: value } }));
        });
    }, []);

    const handleCommentChange = useCallback((perguntaId, comment) => {
        startTransition(() => {
            setAnswers(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], comentario: comment } }));
        });
    }, []);

    const handleSubmit = async () => {
        const missingRequired = survey.questions
            .filter(q => q.required && !answers[q.id]?.valor);
        
        if (missingRequired.length > 0) {
            setSubmitError('Por favor, responda todas as perguntas obrigatórias.');
            return;
        }

        if (survey.askForAttendant && !selectedAtendente) {
            setAtendenteError('Obrigatório.');
            setSubmitError('Por favor, selecione o atendente.');
            return;
        }

        setSubmitLoading(true);
        try {
            const finalAnswers = Object.values(answers).filter(a => a.valor !== null);
            const response = await publicSurveyService.submitSurveyResponses(survey.linkToken || pesquisaId, finalAnswers, selectedAtendente);
            
            const surveyState = { respondentSessionId: response.respondentSessionId, answers: finalAnswers, tenantId, atendenteId: selectedAtendente };
            sessionStorage.setItem('surveyState', JSON.stringify(surveyState));
            
            const storedPhone = localStorage.getItem('clientPhone');
            navigate(storedPhone ? `/confirmar-cliente/${survey.linkToken || pesquisaId}` : `/identificacao-pesquisa/${tenantId}/${survey.linkToken || pesquisaId}`);
        } catch (err) {
            setSubmitError('Erro ao enviar respostas.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const renderQuestionInput = (question) => {
        const answer = answers[question.id];
        switch (question.type) {
            case 'rating_1_5': return <Rating1to5 question={question} answer={answer} onChange={handleAnswerChange} />;
            case 'rating_0_10': return <Rating0to10 question={question} answer={answer} onChange={handleAnswerChange} theme={theme} />;
            case 'multiple_choice': return <MultipleChoice question={question} answer={answer} onChange={handleAnswerChange} theme={theme} />;
            case 'free_text': return <TextField fullWidth multiline rows={3} placeholder="Sua resposta..." value={answer?.valor || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)} variant="outlined" sx={{ mt: 1 }} />;
            default: return null;
        }
    };

    return (
        <div style={{ 
            ...CRITICAL_STYLES.container, 
            backgroundColor: theme.palette.primary.main,
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
        }}>
            <div style={CRITICAL_STYLES.paper}>
                {/* Header em HTML Puro para LCP Instantâneo */}
                <div style={{ 
                    ...CRITICAL_STYLES.header, 
                    backgroundColor: theme.palette.secondary.main,
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`
                }}>
                    <div style={CRITICAL_STYLES.logoContainer}>
                        {survey.restaurantLogoUrl ? (
                            <img 
                                src={`${process.env.REACT_APP_API_URL}${survey.restaurantLogoUrl}`} 
                                alt="Logo" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        ) : (
                            <Star style={{ color: theme.palette.primary.main, fontSize: '35px' }} />
                        )}
                    </div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{survey.title}</h1>
                    {survey.description && (
                        <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.9 }}>{survey.description}</p>
                    )}
                </div>

                <div style={{ padding: '24px 16px' }}>
                    {(survey.questions || []).slice(0, visibleCount).map((question, index) => (
                        <div 
                            key={question.id} 
                            style={{ 
                                marginBottom: '40px', 
                                contentVisibility: 'auto', 
                                containIntrinsicSize: '1px 200px'
                            }}
                        >
                            <h2 style={{ 
                                margin: '0 0 16px', 
                                fontSize: '1.05rem', 
                                fontWeight: 600, 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                color: '#333'
                            }}>
                                <span style={{ marginRight: '8px', color: theme.palette.primary.main }}>{index + 1}.</span>
                                {question.text}
                                {question.required && <span style={{ color: '#d32f2f', marginLeft: '4px' }}>*</span>}
                            </h2>
                            
                            {renderQuestionInput(question)}

                            {(question.type.startsWith('rating')) && (
                                <TextField 
                                    fullWidth 
                                    label="Comentário (opcional)" 
                                    multiline 
                                    rows={2} 
                                    value={answers[question.id]?.comentario || ''} 
                                    onChange={(e) => handleCommentChange(question.id, e.target.value)} 
                                    sx={{ mt: 1.5 }} 
                                    variant="standard"
                                />
                            )}
                        </div>
                    ))}

                    {/* Atendente Selection */}
                    {survey.askForAttendant && (
                        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #eee' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: '#333' }}>
                                Qual atendente realizou o seu atendimento?
                            </h3>
                            <FormControl fullWidth error={!!atendenteError} variant="outlined">
                                <InputLabel>Selecione o Atendente</InputLabel>
                                <Select 
                                    value={selectedAtendente} 
                                    label="Selecione o Atendente" 
                                    onChange={(e) => {
                                        setSelectedAtendente(e.target.value);
                                        setAtendenteError(null);
                                    }}
                                >
                                    <MenuItem value=""><em>Não me lembro / Outro</em></MenuItem>
                                    {atendentes.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                                </Select>
                                {atendenteError && <FormHelperText>{atendenteError}</FormHelperText>}
                            </FormControl>
                        </div>
                    )}

                    {submitError && (
                        <Alert severity="error" sx={{ mt: 4, borderRadius: '12px' }}>{submitError}</Alert>
                    )}

                    <div style={{ marginTop: '48px', textAlign: 'center' }}>
                        <Button 
                            variant="contained" 
                            size="large"
                            onClick={handleSubmit} 
                            disabled={submitLoading}
                            sx={{ 
                                px: 8, 
                                py: 1.5, 
                                borderRadius: '50px',
                                fontSize: '1.1rem',
                                boxShadow: `0 8px 20px ${theme.palette.primary.main}40`
                            }}
                        >
                            {submitLoading ? <CircularProgress size={26} color="inherit" /> : 'Finalizar Pesquisa'}
                        </Button>
                    </div>
                </div>
            </div>
            
            <div style={{ textAlign: 'center', paddingBottom: '32px', color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}>
                <span style={{ fontSize: '12px' }}>Powered by Voltaki</span>
            </div>
        </div>
    );
};

export default PublicSurveyPage;