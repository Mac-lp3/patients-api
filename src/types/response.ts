interface BaseResponse {
    metadata: any;
}

interface ErrorResponse extends BaseResponse {
    error: any;
}

interface ResourceResponse extends BaseResponse {
    payload: any | any[];
}

export type ApiResponse = ErrorResponse | ResourceResponse;
