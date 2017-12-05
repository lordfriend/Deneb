import { User } from './user';

export class WebHook {
    id: string;
    name: string;
    description: string;
    url: string;
    status?: number;
    consecutive_failure_count?: number;
    register_time?: number;
    created_by: User;
    shared_secret?: string;
    permissions: string[];


    static STATUS_IS_ALIVE = 1;
    static STATUS_HAS_ERROR = 2;
    static STATUS_IS_DEAD = 3;
    static STATUS_INITIAL = 4;

    static PERMISSION_FAVORITE = 'PERM_FAVORITE';
    static PERMISSION_EMAIL = 'PERM_EMAIL';
}

export const PERM_NAME = {
    [WebHook.PERMISSION_FAVORITE]: '用户收藏',
    [WebHook.PERMISSION_EMAIL]: '用户邮件地址'
};
