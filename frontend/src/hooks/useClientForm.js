import { useState, useEffect } from 'react';

// Helper to format date from YYYY-MM-DD (or ISO string) to DD/MM/YYYY
const formatDateToMask = (dateString) => {
    if (!dateString) return '';
    // Handles both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss.sssZ'
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    if (day && month && year) {
        return `${day}/${month}/${year}`;
    }
    return ''; // Return empty if format is unexpected
};


const useClientForm = (initialData) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                birthDate: formatDateToMask(initialData.birthDate)
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return { formData, handleChange };
};

export default useClientForm;