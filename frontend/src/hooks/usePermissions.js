
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const usePermissions = () => {
    const { user } = useContext(AuthContext);

    const canCreateSurvey = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.SURVEY_CREATOR;

    const canViewSurveyResults = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.SURVEY_CREATOR || user?.role === ROLES.SURVEY_VIEWER;

    const canEditSurvey = (survey) => {
        return user?.role === ROLES.SUPER_ADMIN || (user?.role === ROLES.SURVEY_CREATOR && survey?.creator_id === user?.userId);
    };

    const canDeleteSurvey = (survey) => {
        return user?.role === ROLES.SUPER_ADMIN || (user?.role === ROLES.SURVEY_CREATOR && survey?.creator_id === user?.userId);
    };

    return { canCreateSurvey, canViewSurveyResults, canEditSurvey, canDeleteSurvey };
};

export default usePermissions;
