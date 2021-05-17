export interface ResourceInput {
    // EXTEND THIS IN YOUR RESOURCE TYPE DEF
}

export interface GeneralQueryInput {
    limit?: number;
    offset?: number;
    query?: string;
}

export interface ValidatedInput<T extends ResourceInput> {
    generalInput: GeneralQueryInput;
    resourceInput: T;
}