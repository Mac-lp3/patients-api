import { ApiError } from './error';

interface BaseResponse {
    metadata: any;
}

export interface ErrorResponse extends BaseResponse {
    error: ApiError;
}

export interface ResourceResponse extends BaseResponse {
    payload: any;
}
