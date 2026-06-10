import { getCurrentUser } from '@/lib/auth';
import { fail, ok } from '@/lib/response';

export const getProfile = async () => {
    try {
        const currenUser = await getCurrentUser();
        if (!currenUser) {
            return ok('No user logged in', null);
        }
        return ok('Profile fetched successfully', currenUser);
    } catch (error) {
        return fail('Failed to fetch profile');
    }
};
