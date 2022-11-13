export type ApiAuthenticationResponse = {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
};

export type ApiError = {
    message: string;
};
