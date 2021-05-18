import { Request } from 'express';
import * as validate from './validator';
import { MemDao } from '../../shared/dao';
import { ApiError } from '../../types/error';
import { build } from '../../shared/response';
import { ApiResponse } from '../../types/response';

// TODO assign this
let dao: MemDao = new MemDao();

/**
 * 200
 * @param request 
 * @returns 
 */
export async function getPatientCollection(request: Request): Promise<ApiResponse> {

    let meta: any = {};
    let rawPayload: any;

    try {

        const daoInput = validate.queryParams(request.query);
        
        const [patients, total] = await Promise.all([
            dao.findBy(daoInput),
            dao.total(daoInput)
        ]);

        meta.total = total;
        meta.httpCode = total > 0 ? '200' : '204'
        rawPayload = patients;

    } catch (ex) {

        if (ex instanceof ApiError) {
            rawPayload = ex;
        } else {
            console.log(ex);
            rawPayload = new ApiError('000', 'Uncaught exception in the validation or DB layer. Double check inputs.', []);
        }
        
    }

    const resp: ApiResponse = await build(meta, rawPayload);
    
    return resp;
}

export async function postPatientCollection(request: Request): Promise<ApiResponse> {

    let meta: any = {};
    let rawPayload: any;

    try {

        const daoInput = validate.postCollectionBody(request.body);
        const patient = await dao.addPatient(daoInput);

        meta.total = 1;
        meta.httpCode = '201';
        rawPayload = patient;

    } catch (err) {

        if (err instanceof ApiError) {
            rawPayload = err;
        } else {
            console.log(err);
            rawPayload = new ApiError('000', 'Uncaught exception in the validation or DB layer. Double check inputs.', []);
        }
        
    }

    const resp: ApiResponse = await build(meta, rawPayload);
    
    return resp;
}

export async function getPatientInstance(request: Request): Promise<ApiResponse> {

    let meta: any = {};
    let rawPayload: any;

    try {

        validate.patientID(request.params.patientID);
        const patient = await dao.getPatient(request.params.patientID);

        meta.total = 1;
        meta.httpCode = '200';
        rawPayload = patient;

    } catch (err) {

        if (err instanceof ApiError) {
            rawPayload = err;
        } else {
            console.log(err);
            rawPayload = new ApiError('000', 'Uncaught exception in the validation or DB layer. Double check inputs.', []);
        }
        
    }

    const resp: ApiResponse = await build(meta, rawPayload);
    
    return resp;
}

export async function putPatientInstance(request: Request): Promise <ApiResponse> {

    let meta: any = {};
    let rawPayload: any;

    try {

        validate.patientID(request.params.patientID);
        const daoInput = validate.putInstanceBody(request.body);

        const patient = await dao.putPatient(request.params.patientID, daoInput);

        meta.total = 1;
        meta.httpCode = '201';
        rawPayload = patient;

    } catch (err) {

        if (err instanceof ApiError) {
            rawPayload = err;
        } else {
            console.log(err);
            rawPayload = new ApiError('000', 'Uncaught exception in the validation or DB layer. Double check inputs.', []);
        }
        
    }

    const resp: ApiResponse = await build(meta, rawPayload);
    
    return resp;
}

export async function patchPatientInstance(request: Request): Promise <ApiResponse> {
    
    let meta: any = {};
    let rawPayload: any;

    try {

        validate.patientID(request.params.patientID);
        const daoInput = validate.patchInstanceBody(request.body);

        const patient = await dao.patchPatient(request.params.patientID, daoInput);

        meta.total = 1;
        meta.httpCode = '200';
        rawPayload = patient;

    } catch (err) {

        if (err instanceof ApiError) {
            rawPayload = err;
        } else {
            console.log(err);
            rawPayload = new ApiError('000', 'Uncaught exception in the validation or DB layer. Double check inputs.', []);
        }
        
    }

    const resp: ApiResponse = await build(meta, rawPayload);
    
    return resp;
}

export async function deletePatientInstance(request: Request): Promise <ApiResponse> {
    
    let meta: any = {};
    let rawPayload: any;

    try {

        validate.patientID(request.params.patientID);
        await dao.deletePatient(request.params.patientID);

        meta.total = 1;
        meta.httpCode = '204';
        rawPayload = {};

    } catch (err) {

        if (err instanceof ApiError) {
            rawPayload = err;
        } else {
            console.log(err);
            rawPayload = new ApiError('000', 'Uncaught exception in the validation or DB layer. Double check inputs.', []);
        }
        
    }

    const resp: ApiResponse = await build(meta, rawPayload);
    
    return resp;
}
