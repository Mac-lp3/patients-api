import { Request } from 'hapi';
import { ok, strictEqual, notStrictEqual, fail } from 'assert';
import { getPatientCollection, postPatientCollection } from '../src/endpoints/patients/handlers';
import { ApiResponse, ErrorResponse, ResourceResponse } from '../src/types/response';

describe('The patient endpoints handlers', function() {

    it('should return the list of patients', async function() {

        let resp: ApiResponse = await getPatientCollection({} as Request);

        ok(resp.metadata.hasOwnProperty('total'));
        strictEqual(resp.metadata.httpCode, '200');
        ok(Array.isArray( (resp as ResourceResponse).payload ));
        ok((resp as ResourceResponse).payload.length > 0);
    })

    it('should apply filters to GET requests', async function() {

        // check with filter
        let queryParms: any = {
            lastName: 'doe'
        }
        let req: any = { query: queryParms };
        let resp: ApiResponse = await getPatientCollection(req as any);

        ok(resp.metadata.hasOwnProperty('total'));
        strictEqual(resp.metadata.httpCode, '200');
        ok(Array.isArray( (resp as ResourceResponse).payload ));
        strictEqual((resp as ResourceResponse).payload.length, 1);

        // check with query
        queryParms = {
            query: 'doe'
        }
        req = { query: queryParms };
        resp = await getPatientCollection(req as any);

        ok(resp.metadata.hasOwnProperty('total'));
        strictEqual(resp.metadata.httpCode, '200');
        ok(Array.isArray( (resp as ResourceResponse).payload ));
        strictEqual((resp as ResourceResponse).payload.length, 1);

        // check no results behavior
        queryParms = {
            lastName: 'gilmore'
        }
        req = { query: queryParms };
        resp = await getPatientCollection(req as any);

        ok(resp.metadata.hasOwnProperty('total'));
        strictEqual(resp.metadata.httpCode, '204');
        ok(Array.isArray( (resp as ResourceResponse).payload ));
        strictEqual((resp as ResourceResponse).payload.length, 0);
    })

    it('should post as expected', async function() {

        // test initial post
        let reqPayload: any = {
            firstName: 'Maggie',
            lastName: 'Simpson',
            dob: '2000'
        }
        let req: any = { payload: reqPayload };

        let resp = await postPatientCollection(req);

        strictEqual(resp.metadata.total, 1);
        strictEqual(resp.metadata.httpCode, '201');
        ok((resp as ResourceResponse).payload.hasOwnProperty('id'));
        ok((resp as ResourceResponse).payload.hasOwnProperty('created'));
        strictEqual((resp as ResourceResponse).payload.firstName, 'Maggie');
        strictEqual((resp as ResourceResponse).payload.lastName, 'Simpson');

        // test posting the exact same message
        resp = await postPatientCollection(req);

        strictEqual(resp.metadata.httpCode, '409');
        ok((resp as ErrorResponse).error.hasOwnProperty('summary'));
        ok((resp as ErrorResponse).error.hasOwnProperty('details'));
        ok((resp as ErrorResponse).error.hasOwnProperty('resources'));
    })

});