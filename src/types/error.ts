export interface ApiError {
    code: string;
    details: string;
    resources: string[];
}

abstract class BaseError {
    public details: string;

    constructor(someStr: string) {
        this.details = someStr;
    }
}

export class TypeValidationError extends BaseError { }

export class RequiredInputError extends BaseError { }
