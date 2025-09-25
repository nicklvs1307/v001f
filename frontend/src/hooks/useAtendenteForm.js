
import { useState, useEffect } from 'react';

const useAtendenteForm = (initialData) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        status: 'active',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                status: initialData.status || 'active',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                status: 'active',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return { formData, handleChange, setFormData };
};

export default useAtendenteForm;
