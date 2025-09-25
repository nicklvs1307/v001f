
import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Falha ao buscar usuários.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const createUser = async (userData) => {
        try {
            const newUser = await userService.createUser(userData);
            fetchUsers();
            return newUser;
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar usuário.');
        }
    };

    const updateUser = async (id, userData) => {
        try {
            const updatedUser = await userService.updateUser(id, userData);
            fetchUsers();
            return updatedUser;
        } catch (err) {
            throw new Error(err.message || 'Falha ao atualizar usuário.');
        }
    };

    const deleteUser = async (id) => {
        try {
            await userService.deleteUser(id);
            fetchUsers();
        } catch (err) {
            throw new Error(err.message || 'Falha ao deletar usuário.');
        }
    };

    return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser };
};

export default useUsers;
