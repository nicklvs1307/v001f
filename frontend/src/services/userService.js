import apiAuthenticated from './apiAuthenticated';

/**
 * Serviço para lidar com operações relacionadas a usuários.
 */

const getAllUsers = async () => {
    const response = await apiAuthenticated.get('/users');
    return response.data;
};

/**
 * Cria um novo usuário.
 * @param {object} userData - Os dados do usuário a serem criados.
 * @returns {Promise<object>} O usuário criado.
 * @throws {object} O objeto de erro da resposta da API.
 */
const createUser = async (userData) => {
    const response = await apiAuthenticated.post('/users', userData);
    return response.data;
};

/**
 * Atualiza um usuário existente.
 * @param {string} id - O ID do usuário a ser atualizado.
 * @param {object} userData - Os dados do usuário a serem atualizados.
 * @returns {Promise<object>} O usuário atualizado.
 * @throws {object} O objeto de erro da resposta da API.
 */
const updateUser = async (id, userData) => {
    const response = await apiAuthenticated.put(`/users/${id}`, userData);
    return response.data;
};

/**
 * Faz o upload da foto de perfil de um usuário.
 * @param {string} userId - O ID do usuário.
 * @param {File} file - O arquivo da imagem de perfil.
 * @returns {Promise<object>} Os dados da resposta do upload.
 */
const uploadProfilePicture = async (userId, file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await apiAuthenticated.post(`/users/${userId}/upload-profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

/**
 * Deleta um usuário.
 * @param {string} id - O ID do usuário a ser deletado.
 * @returns {Promise<object>} Os dados da resposta da deleção.
 * @throws {object} O objeto de erro da resposta da API.
 */
const deleteUser = async (id) => {
    const response = await apiAuthenticated.delete(`/users/${id}`);
    return response.data;
};

const userService = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    uploadProfilePicture, // Exportar a nova função
};

export default userService;
