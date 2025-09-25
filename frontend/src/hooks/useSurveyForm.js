import { useState, useCallback, useEffect } from 'react';

const useSurveyForm = (initialData = {}) => {
    const [survey, setSurvey] = useState(initialData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setSurvey(initialData);
        }
    }, [initialData]);

    const validateDates = (updatedSurvey) => {
        const newErrors = { ...errors };
        if (updatedSurvey.startDate && updatedSurvey.endDate && new Date(updatedSurvey.endDate) < new Date(updatedSurvey.startDate)) {
            newErrors.endDate = 'A data de término não pode ser anterior à data de início.';
        } else {
            delete newErrors.endDate;
        }
        setErrors(newErrors);
    };

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setSurvey((prevSurvey) => {
            const updatedSurvey = {
                ...prevSurvey,
                [name]: type === 'checkbox' ? checked : value,
            };
            if (name === 'startDate' || name === 'endDate') {
                validateDates(updatedSurvey);
            }
            return updatedSurvey;
        });
    }, []);

    const handleAddQuestion = useCallback(() => {
        setSurvey((prevSurvey) => ({
            ...prevSurvey,
            questions: [...(prevSurvey.questions || []), { text: '', type: 'text', options: [] }],
        }));
    }, []);

    const handleQuestionChange = useCallback((qIndex, e) => {
        const { name, value } = e.target;
        setSurvey((prevSurvey) => {
            const newQuestions = [...prevSurvey.questions];
            newQuestions[qIndex] = { ...newQuestions[qIndex], [name]: value };
            return { ...prevSurvey, questions: newQuestions };
        });
    }, []);

    const handleCriterioChange = useCallback((qIndex, criterioId) => {
        setSurvey((prevSurvey) => {
            const newQuestions = [...prevSurvey.questions];
            newQuestions[qIndex] = { ...newQuestions[qIndex], criterioId: criterioId };
            return { ...prevSurvey, questions: newQuestions };
        });
    }, []);

    const handleQuestionTypeChange = useCallback((qIndex, type) => {
        setSurvey((prevSurvey) => {
            const newQuestions = [...prevSurvey.questions];
            newQuestions[qIndex] = { ...newQuestions[qIndex], type: type, options: [] };
            return { ...prevSurvey, questions: newQuestions };
        });
    }, []);

    const handleOptionChange = useCallback((qIndex, oIndex, e) => {
        const { value } = e.target;
        setSurvey((prevSurvey) => {
            const newQuestions = [...prevSurvey.questions];
            newQuestions[qIndex].options[oIndex] = { ...newQuestions[qIndex].options[oIndex], text: value };
            return { ...prevSurvey, questions: newQuestions };
        });
    }, []);

    const handleAddOption = useCallback((qIndex) => {
        setSurvey((prevSurvey) => {
            const newQuestions = [...prevSurvey.questions];
            newQuestions[qIndex].options = [...(newQuestions[qIndex].options || []), { text: '' }];
            return { ...prevSurvey, questions: newQuestions };
        });
    }, []);

    const handleRemoveOption = useCallback((qIndex, oIndex) => {
        setSurvey((prevSurvey) => {
            const newQuestions = [...prevSurvey.questions];
            newQuestions[qIndex].options.splice(oIndex, 1);
            return { ...prevSurvey, questions: newQuestions };
        });
    }, []);

    const handleRemoveQuestion = useCallback((qIndex) => {
        setSurvey((prevSurvey) => {
            const newQuestions = [...prevSurvey.questions];
            newQuestions.splice(qIndex, 1);
            return { ...prevSurvey, questions: newQuestions };
        });
    }, []);

    return {
        survey,
        setSurvey,
        errors,
        handleChange,
        handleAddQuestion,
        handleQuestionChange,
        handleCriterioChange,
        handleQuestionTypeChange,
        handleOptionChange,
        handleAddOption,
        handleRemoveOption,
        handleRemoveQuestion,
    };
};

export default useSurveyForm;