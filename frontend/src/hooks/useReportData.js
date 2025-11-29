import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getNowInLocalTimezone } from '../utils/dateUtils';
import dashboardService from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

const useReportData = (reportType) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const tenantId = user?.tenantId;
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(getNowInLocalTimezone());

    const fetchResults = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const params = { tenantId };
            if (selectedDate) {
                params.date = selectedDate.toISOString();
            }

            let resultData;
            if (reportType === 'diario') {
                resultData = await dashboardService.getDailyReport(params);
            } else if (reportType === 'semanal') {
                resultData = await dashboardService.getWeeklyReport(params);
            } else if (reportType === 'mensal') {
                resultData = await dashboardService.getMonthlyReport(params);
            }
            
            setReportData(resultData);
        } catch (err) {
            setError(err.message || 'Falha ao carregar os resultados.');
        } finally {
            setLoading(false);
        }
    }, [tenantId, selectedDate, reportType]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const dateParam = queryParams.get('date');
        if (dateParam) {
            setSelectedDate(new Date(`${dateParam}T00:00:00`));
        }
    }, [location.search]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);
    
    const handleDateChange = (newValue) => {
        setSelectedDate(newValue);
        const formattedDate = format(newValue, 'yyyy-MM-dd');
        navigate(`?date=${formattedDate}`);
    };

    return { reportData, loading, error, selectedDate, handleDateChange };
};

export default useReportData;
