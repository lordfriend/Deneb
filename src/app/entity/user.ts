export class User {
    id: string;
    name: string;
    password: string;
    password_repeat: string;
    level: number;
    invite_code: string;
    remember: boolean;
    email: string;
    email_confirmed: boolean;

    static LEVEL_DEFAULT = 0;
    static LEVEL_USER = 1;
    static LEVEL_ADMIN = 2;
    static LEVEL_SUPER_USER = 3;
}
