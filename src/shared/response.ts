/**
 * This script defines and exports a function that builds a response object from a given
 * resource or error.
 * 
 * If the payload is an error, it looks up the corresponding code in a CSV file, where
 * additional details are contained.
 */
import * as path from 'path';
import { Parser } from 'csv-parse';
import { createReadStream } from 'fs';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/response';

const CSV_FILE_NAME = '../conf/errorCodes.csv';
const CSV_FILE_PATH = path.join(__dirname, CSV_FILE_NAME);

/**
 * Returns a fully formed response payload. This object can then be passed to the framework 
 * specific response object.
 * 
 * @param metaData An object containing any metadata relevent to the resource. Not used if the payload is an error.
 * @param errorOrResource Either a single resource, array of resources, or an ApiError object.
 * @returns 
 */
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