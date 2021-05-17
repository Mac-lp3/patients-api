import * as path from 'path';
import { Parser } from 'csv-parse';
import { createReadStream } from 'fs';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/response';

const CSV_FILE_NAME = '../conf/errorCodes.csv';
const CSV_FILE_PATH = path.join(__dirname, '../conf/errorCodes.csv');


export async function build(metaData: any, errorOrResource: any): Promise<ApiResponse> {

    let response: ApiResponse;

    if (errorOrResource instanceof ApiError) {
        response = await buildFromError(errorOrResource);
    } else {
        response = buildFromResource(metaData, errorOrResource);
    }
    
    return response;
}

async function buildFromError(apiError: ApiError): Promise<ApiResponse> {

    const csvParser = createReadStream(CSV_FILE_PATH).pipe(new Parser({}));

    const lookUpCode = apiError.code;
    let errConf: string[] = ['', '', ''];
    for await (let line of csvParser) {
        if (line[0] === lookUpCode) {
            errConf = line;
            break;
        }

        // grab the unknown code, just in case
        if (line[0] === '000') {
            errConf = line;
        }
    }

    const respObject: ApiResponse = {
        metadata: {
            httpCode: errConf[1] ? errConf[1] : '500'
        },
        error: {
            summary: errConf[2] ? errConf[2] : 'idk',
            details: apiError.details ? apiError.details : 'sorry idk wtf is going on',
            resources: apiError.resources ? apiError.resources : ['']
        }
    }

    return respObject;
}

function buildFromResource(metadata: any, resource: any): ApiResponse {

    // use default response code if none given
    metadata.httpCode = metadata.httpCode ? metadata.httpCode : '200';

    const respObject: ApiResponse = {
        metadata: metadata,
        payload: resource
    }

    return respObject;
}