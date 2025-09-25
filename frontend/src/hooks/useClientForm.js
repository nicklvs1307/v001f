
import { useState, useEffect } from 'react';

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
                birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : ''
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
