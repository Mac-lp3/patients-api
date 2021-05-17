abstract class BaseError {
    public details: string;

    constructor(someStr: string) {
        this.details = someStr;
    }
}

export class TypeValidationError extends BaseError { }

export class RequiredInputError extends BaseError { }

export class ApiError extends BaseError{
    public code: string;
    public resources: string[];

    constructor(code: string, details: string, resources: string[]) {
        super(details);
        this.code = code;
        this.resources = resources;
    }
}
