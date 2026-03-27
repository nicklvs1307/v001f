import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { Star, StarBorder, CheckCircle } from '@mui/icons-material';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';

const CRITICAL_STYLES = {
    container: {
        minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '20px 16px', boxSizing: 'border-box',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
    },
    paper: {
        width: '100%', maxWidth: '552px', backgroundColor: '#fff',
        borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    header: { padding: '32px 16px', textAlign: 'center', color: '#fff' },
    logoContainer: {
        width: '80px', height: '80px', backgroundColor: '#fff', borderRadius: '50%',
        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid rgba(255,255,255,0.3)'
    }
};

const isValidUUID = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

const Rating1to5 = React.memo(({ question, answer, onChange }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '16px 0', flexWrap: 'wrap' }} role="radiogroup" aria-label={`Avaliação: ${question.text}`}>
            {[1, 2, 3, 4, 5].map(value => (
                <button
                    key={value}
                    onClick={() => onChange(question.id, value)}
                    aria-label={`Avaliar com ${value} estrelas`}
                    aria-pressed={answer?.valor >= value}
                    style={{
                        color: (answer?.valor) >= value ? '#ffc107' : '#e0e0e0',
                        transform: (answer?.valor) === value ? 'scale(1.2)' : 'scale(1)',
                        transition: 'color 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        padding: '12px', minWidth: '48px', minHeight: '48px',
                        background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    {(answer?.valor) >= value ? <Star style={{ fontSize: '40px' }} /> : <StarBorder style={{ fontSize: '40px' }} />}
                </button>
            ))}
        </div>
        <p style={{ fontSize: '12px', textAlign: 'center', color: '#777', margin: 0 }}>Toque nas estrelas para avaliar</p>
    </div>
));

const Rating0to10 = React.memo(({ question, answer, onChange, theme }) => {
    const primaryMain = theme.palette.primary.main;
    const textSecondary = theme.palette.text.secondary;

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '24px 0', flexWrap: 'wrap' }} role="radiogroup" aria-label={`Nota de 0 a 10: ${question.text}`}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
                    const isSelected = answer?.valor === value;
                    return (
                        <button
                            key={value}
                            onClick={() => onChange(question.id, value)}
                            aria-label={`Nota ${value}`}
                            aria-pressed={isSelected}
                            style={{
                                width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer',
                                border: `2px solid ${isSelected ? primaryMain : '#e0e0e0'}`,
                                backgroundColor: isSelected ? primaryMain : 'transparent',
                                color: isSelected ? 'white' : textSecondary,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.15s ease',
                                padding: 0
                            }}
                        >
                            {value}
                        </button>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }} role="radiogroup" aria-label={question.text}>
            {(question.options || []).map((opcao) => {
                const isSelected = String(answer?.valor) === String(opcao.text);
                return (
                    <button
                        key={opcao.id || opcao.text}
                        onClick={() => onChange(question.id, String(opcao.text))}
                        aria-pressed={isSelected}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px', borderRadius: '12px', minHeight: '48px',
                            border: `2px solid ${isSelected ? primaryMain : '#eee'}`,
                            backgroundColor: isSelected ? `${primaryMain}15` : 'white',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                            fontFamily: 'inherit', fontSize: '1rem', textAlign: 'left', width: '100%'
                        }}
                    >
                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opcao.text}</span>
                        <div style={{
                            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${isSelected ? primaryMain : '#ccc'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isSelected ? primaryMain : 'transparent'
                        }}>
                            {isSelected && <CheckCircle style={{ color: 'white', fontSize: '16px' }} />}
                        </div>
                    </button>
                );
            })}
        </div>
    );
});

const PublicSurveyPage = () => {
    const { tenantId, pesquisaId } = useParams();
    const [surveyData, setSurveyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dynamicTheme = useMemo(() => {
        if (!surveyData) return null;
        return getDynamicTheme({ primaryColor: surveyData.primaryColor, secondaryColor: surveyData.secondaryColor });
    }, [surveyData]);

    useEffect(() => {
        const controller = new AbortController();

        if (!pesquisaId || !isValidUUID(pesquisaId)) {
            setError('ID da pesquisa inválido.');
            setLoading(false);
            return;
        }

        publicSurveyService.getPublicSurveyById(pesquisaId)
            .then(data => {
                if (!controller.signal.aborted) setSurveyData(data);
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                setError(err.response?.status === 410 ? 'Link expirado.' : 'Erro ao carregar pesquisa.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [pesquisaId]);

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
    const location = useLocation();
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
    const [isAtendentePreDefined, setIsAtendentePreDefined] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [atendenteError, setAtendenteError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const atendenteIdFromUrl = params.get('atendenteId');
        if (atendenteIdFromUrl) {
            setSelectedAtendente(atendenteIdFromUrl);
            setIsAtendentePreDefined(true);
        }

        if (survey.askForAttendant) {
            const controller = new AbortController();
            publicSurveyService.getPublicAtendentes(tenantId)
                .then(data => {
                    if (!controller.signal.aborted) setAtendentes(data);
                })
                .catch(() => {});
            return () => controller.abort();
        }
    }, [survey.askForAttendant, tenantId, location.search]);

    const handleAnswerChange = useCallback((perguntaId, value) => {
        setAnswers(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], valor: value } }));
    }, []);

    const handleCommentChange = useCallback((perguntaId, comment) => {
        setAnswers(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], comentario: comment } }));
    }, []);

    const handleSubmit = useCallback(async () => {
        const missingRequired = survey.questions.filter(q => q.required && !answers[q.id]?.valor);
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
            const baseUrl = storedPhone ? `/confirmar-cliente/${survey.linkToken || pesquisaId}` : `/identificacao-pesquisa/${tenantId}/${survey.linkToken || pesquisaId}`;
            const redirectUrl = isAtendentePreDefined ? `${baseUrl}?atendenteId=${selectedAtendente}` : baseUrl;
            navigate(redirectUrl);
        } catch (err) {
            setSubmitError('Erro ao enviar respostas.');
        } finally {
            setSubmitLoading(false);
        }
    }, [answers, survey, selectedAtendente, pesquisaId, tenantId, isAtendentePreDefined, navigate]);

    const renderQuestionInput = (question) => {
        const answer = answers[question.id];
        switch (question.type) {
            case 'rating_1_5': return <Rating1to5 question={question} answer={answer} onChange={handleAnswerChange} />;
            case 'rating_0_10': return <Rating0to10 question={question} answer={answer} onChange={handleAnswerChange} theme={theme} />;
            case 'multiple_choice': return <MultipleChoice question={question} answer={answer} onChange={handleAnswerChange} theme={theme} />;
            case 'free_text': return (
                <textarea
                    aria-label={question.text}
                    maxLength={2000}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc',
                        fontFamily: 'inherit', fontSize: '1rem', minHeight: '100px', boxSizing: 'border-box'
                    }}
                    placeholder="Sua resposta..."
                    value={answer?.valor || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
            );
            default: return null;
        }
    };

    return (
        <div style={{
            ...CRITICAL_STYLES.container,
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
        }}>
            <div style={CRITICAL_STYLES.paper}>
                <div style={{
                    ...CRITICAL_STYLES.header,
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`
                }}>
                    <div style={CRITICAL_STYLES.logoContainer}>
                        {survey.restaurantLogoUrl ? (
                            <img src={`${process.env.REACT_APP_API_URL}${survey.restaurantLogoUrl}`} alt={survey.restaurantName || 'Logo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Star style={{ color: theme.palette.primary.main, fontSize: '35px' }} />
                        )}
                    </div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{survey.title}</h1>
                    {survey.description && <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.9 }}>{survey.description}</p>}
                </div>

                <div style={{ padding: '24px 16px' }}>
                    {(survey.questions || []).map((question, index) => (
                        <div key={question.id} style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600,
                                display: 'flex', alignItems: 'flex-start', color: '#333'
                            }}>
                                <span style={{ marginRight: '8px', color: theme.palette.primary.main }}>{index + 1}.</span>
                                {question.text}
                                {question.required && <span style={{ color: '#d32f2f', marginLeft: '4px' }} aria-hidden="true">*</span>}
                            </h2>

                            {renderQuestionInput(question)}

                            {question.type.startsWith('rating') && (
                                <div style={{ marginTop: '16px' }}>
                                    <label htmlFor={`comment-${question.id}`} style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Comentário (opcional)</label>
                                    <textarea
                                        id={`comment-${question.id}`}
                                        maxLength={2000}
                                        style={{
                                            width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd',
                                            fontFamily: 'inherit', fontSize: '0.9rem', minHeight: '60px', boxSizing: 'border-box'
                                        }}
                                        value={answers[question.id]?.comentario || ''}
                                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {survey.askForAttendant && !isAtendentePreDefined && (
                        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #eee' }}>
                            <label htmlFor="attendant-select" style={{ display: 'block', margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 600, color: '#333' }}>
                                Qual atendente realizou o seu atendimento?
                            </label>
                            <select
                                id="attendant-select"
                                value={selectedAtendente}
                                onChange={(e) => { setSelectedAtendente(e.target.value); setAtendenteError(null); }}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px',
                                    border: `1px solid ${atendenteError ? '#d32f2f' : '#ccc'}`,
                                    fontSize: '1rem', backgroundColor: '#fff', cursor: 'pointer'
                                }}
                            >
                                <option value="">Não me lembro / Outro</option>
                                {atendentes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            {atendenteError && <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{atendenteError}</p>}
                        </div>
                    )}

                    {isAtendentePreDefined && survey.askForAttendant && (
                        <div style={{ marginTop: '24px', textAlign: 'center', opacity: 0.7 }}>
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                Atendimento identificado: <strong>{atendentes.find(a => a.id === selectedAtendente)?.name || 'Carregando...'}</strong>
                            </Typography>
                        </div>
                    )}

                    {submitError && (
                        <div role="alert" style={{ marginTop: '24px', padding: '12px', borderRadius: '12px', backgroundColor: '#fdeded', color: '#5f2120', fontSize: '0.9rem', border: '1px solid #ef9a9a' }}>
                            {submitError}
                        </div>
                    )}

                    <div style={{ marginTop: '48px', textAlign: 'center' }}>
                        <Button
                            variant="contained" size="large" onClick={handleSubmit} disabled={submitLoading}
                            sx={{
                                px: 8, py: 1.5, borderRadius: '50px', fontSize: '1.1rem',
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
