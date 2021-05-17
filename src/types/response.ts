interface BaseResponse {
    metadata: {
        total?: number;
        httpCode: string;
        [key: string]: any;
    };
}

export interface ErrorResponse extends BaseResponse {
    error: {
        summary: string;
        details: string;
        resources: string[];
    };
}

export interface ResourceResponse extends BaseResponse {
    payload: any | any[];
}

/**
 * 
 */
export type ApiResponse = ErrorResponse | ResourceResponse;
