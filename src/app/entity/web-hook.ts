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


    static STATUS_IS_ALIVE = 1;
    static STATUS_HAS_ERROR = 2;
    static STATUS_IS_DEAD = 3;
    static STATUS_INITIAL = 4;
}
