import { ok, strictEqual, notStrictEqual, fail } from 'assert';
import { getPatientInstance, patchPatientInstance } from '../src/endpoints/patients/handlers';
import { ApiResponse, ErrorResponse, ResourceResponse } from '../src/types/response';

const knownIDs = [
    '93af779',
    'fb4a1f6',
    'e13e942',
    '2799f58',
    '3179c55',
    '16104ab',
    'd9a9944',
    'f8071a6',
    '55dd138'
];

describe('The patient endpoints handlers', function() {

    it('should return the corresponding patient given a proper ID', async function() {

        let req: any;
        let resp: ApiResponse;
        
        knownIDs.forEach(async pid => {

            req = { params: { patientID: pid } }
            resp = await getPatientInstance(req);


            strictEqual(resp.metadata.total, 1);
            strictEqual(resp.metadata.httpCode, 200);
            ok(!Array.isArray((resp as ResourceResponse).payload));
            ok((resp as ResourceResponse).payload.hasOwnProperty('lastName'));
            ok((resp as ResourceResponse).payload.hasOwnProperty('firstName'));
        })

    })

    it('should send expected error if ID not found', async function() {

        let req: any = { params: { patientID: '0000000' } };
        let resp: ApiResponse = await getPatientInstance(req);

        strictEqual(resp.metadata.httpCode, '404');
        strictEqual(Object.keys(resp.metadata).length, 1);
        ok((resp as ErrorResponse).error.hasOwnProperty('summary'));
        ok((resp as ErrorResponse).error.hasOwnProperty('details'));
        ok((resp as ErrorResponse).error.hasOwnProperty('resources'));

    })

    it('should send expected error if ID fails validation', async function() {

        let req: any = { params: { patientID: 'XXXXXXX' } };
        let resp: ApiResponse = await getPatientInstance(req);

        strictEqual(resp.metadata.httpCode, '400');
        strictEqual(Object.keys(resp.metadata).length, 1);
        ok((resp as ErrorResponse).error.hasOwnProperty('summary'));
        ok((resp as ErrorResponse).error.hasOwnProperty('details'));
        ok((resp as ErrorResponse).error.hasOwnProperty('resources'));

        req = { params: {  } };
        resp = await getPatientInstance(req);

        strictEqual(resp.metadata.httpCode, '400');
        strictEqual(Object.keys(resp.metadata).length, 1);
        ok((resp as ErrorResponse).error.hasOwnProperty('summary'));
        ok((resp as ErrorResponse).error.hasOwnProperty('details'));
        ok((resp as ErrorResponse).error.hasOwnProperty('resources'));

    })

    it('should patch existing patients as expected', async function() {
        
    })

});