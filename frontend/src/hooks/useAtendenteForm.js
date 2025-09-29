
import { useState, useEffect } from 'react';

const useAtendenteForm = (initialData) => {
    const [formData, setFormData] = useState({
        name: '',
        status: 'active',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                status: initialData.status || 'active',
            });
        } else {
            setFormData({
                name: '',
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
