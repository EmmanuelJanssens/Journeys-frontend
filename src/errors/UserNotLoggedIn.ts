class UserNotLoggedInError extends Error {
    constructor(message: string) {
        super(message);
    }
}
