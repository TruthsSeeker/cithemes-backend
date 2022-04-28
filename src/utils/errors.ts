export class ServerError {
    constructor(public message: string, public status: number) {
    }
}

export class AuthError extends ServerError {
    constructor(message: string) {
        super(message, 401);
    }
}