import { Request } from 'hapi';
import * as validate from './validator';
import { MemDao } from '../../shared/dao';
import { ApiResponse } from '../../types/response';

let dao: MemDao;

export async function getPatientCollection(request: Request): Promise<ApiResponse> {

    try {
        // validate & extract inputs
        const daoInput = validate.getPatientCollection(request.params);

        // TODO get the data and metadata
        //const patients = dao.query();

    } catch (ex) {
        // TODO build resp with exception
    }

    // TODO build with resource
    
    return {} as ApiResponse;
}

export async function postPatientCollection(request: Request): Promise<ApiResponse> {
    return {} as ApiResponse;
}

export async function getPatientInstance(request: Request): Promise<ApiResponse> {
    return {} as ApiResponse;
}

export async function putPatientInstance(request: Request): Promise <ApiResponse> {
    return {} as ApiResponse;
}

export async function patchPatientInstance(request: Request): Promise <ApiResponse> {
    return {} as ApiResponse;
}

export async function deletePatientInstance(request: Request): Promise <ApiResponse> {
    return {} as ApiResponse;
}
