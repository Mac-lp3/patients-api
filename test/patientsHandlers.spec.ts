import { Request } from 'hapi';
import { ok, strictEqual, notStrictEqual, fail } from 'assert';
import { getPatientCollection } from '../src/endpoints/patients/handlers';
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

});