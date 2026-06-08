export const control_object = Object.freeze({
    JWT_SECRET: new TextEncoder().encode(process.env.JWT_SECRET!),
    COOKIE_NAME: 'fin_vault',
    EXPIRY: '7d',
    MAX_AGE: 60 * 60 * 24 * 7,
    SALT_ROUNDS:12,
    JWT_MAX_AGE: 60 * 60 * 24 * 7
});

