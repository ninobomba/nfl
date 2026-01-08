interface WelcomeEmailParams {
    email: string;
    username: string;
    lang: 'en' | 'es';
}
export declare const sendWelcomeEmail: ({ email, username, lang }: WelcomeEmailParams) => Promise<boolean>;
export {};
//# sourceMappingURL=email.service.d.ts.map