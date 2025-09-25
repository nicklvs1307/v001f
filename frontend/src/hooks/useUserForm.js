
import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const useUserForm = (initialData) => {
    const { user: currentUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: '',
        tenantId: ''
    });
    const [roles, setRoles] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRolesAndTenants = async () => {
            try {
                setLoading(true);
                const [rolesResponse, tenantsResponse] = await Promise.all([
                    api.get('/roles'),
                    currentUser.role === 'Super Admin' ? api.get('/tenants') : Promise.resolve({ data: [] })
                ]);
                setRoles(rolesResponse.data);
                setTenants(tenantsResponse.data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Falha ao carregar dados do formulário.');
            } finally {
                setLoading(false);
            }
        };

        fetchRolesAndTenants();

        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                password: '',
                roleId: initialData.role_id || '',
                tenantId: initialData.tenant_id || ''
            });
        } else if (currentUser.role === 'Admin') {
            setFormData(prev => ({ ...prev, tenantId: currentUser.tenantId }));
        }
    }, [initialData, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return { formData, roles, tenants, loading, error, handleChange };
};

export default useUserForm;
