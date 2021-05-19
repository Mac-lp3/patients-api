/**
 * This script:
 *  - initializes the DAO that will be shared by the handlers
 *  - defines and exports the Patients handler methods
 * 
 * The handler functions orchestrate the logic needed to respond to a request.
 * 
 * At a high level, the handler methods:
 *  - accepts a server framework Request object as input
 *  - extracts and validates any user inputs
 *  - asynchronusly calls the downstream systems (just the DAO atm)
 *  - assembles the data (or error) into a formatted response object
 * 
 * The outputs of each step are designed to be inputs for the next.
 */
import { Request } from 'express';
import * as validate from './validator';
import { MemDao } from '../../shared/dao';
import { ApiError } from '../../types/error';
import { build } from '../../shared/response';
import { ApiResponse } from '../../types/response';

// TODO initialize & inject properly
let dao: MemDao = new MemDao();

/**
 * Returns a list of patient objects, based on the request query parameters.
 * 
 * The list will be wrapped in a response object containing metadata, such as the full count of patients meeting the search criteria.
 * 
 * @param request The raw framework request object (expressjs in this case).
 * @returns An ErrorResponse or ResourceResponse. ResourceResponse will have an array as its payload.
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

/**
 * Creates a new Patient Patient instance in the collection.
 * 
 * Since an ID is generated using the firstName, lastName, and dob fields, these are the only required fields. Their
 * values must also be unique enough to produce a unique ID.
 * 
 * @param request The raw framework request object (expressjs in this case).
 * @returns An ErrorResponse or ResourceResponse. ResourceResponse will have a single object as its payload.
 */
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

/**
 * Returns a single Patient instance with the given ID (or a not found ErrorResponse).
 * 
 * @param request The raw framework request object (expressjs in this case).
 * @returns An ErrorResponse or ResourceResponse. ResourceResponse will have a single object as its payload.
 */
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

/**
 * Used to completely replace an existing Patient. 
 * @param request 
 * @returns 
 */
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
