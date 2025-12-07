import apiAuthenticated from './apiAuthenticated';

const roleService = {
  /**
   * Fetches all roles from the API.
   * @returns {Promise<object>} The axios response promise.
   */
  getAllRoles: () => apiAuthenticated.get('/roles'),
};

export default roleService;
