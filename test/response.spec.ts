import { ApiError } from '../src/types/error';
import { build } from '../src/shared/response';
import { ok, strictEqual, notStrictEqual } from 'assert';
import { ApiResponse, ErrorResponse, ResourceResponse } from '../src/types/response';

describe('Response builder', function() {

    it('should build error responses given the appropriate code', async function() {

        let resp: ApiResponse = await build({}, new ApiError('100', 'hmm', ['google.gov']));
        strictEqual(resp.metadata.httpCode, '404')
        strictEqual((resp as ErrorResponse).error.details, 'hmm')
        strictEqual((resp as ErrorResponse).error.resources[0], 'google.gov')

        resp = await build({}, new ApiError('200', 'okokok', ['bing.org']));
        strictEqual(resp.metadata.httpCode, '400')
        strictEqual((resp as ErrorResponse).error.details, 'okokok')
        strictEqual((resp as ErrorResponse).error.resources[0], 'bing.org')

        resp = await build({}, new ApiError('XXX', '', ['yahoo.edu']));
        strictEqual(resp.metadata.httpCode, '500')
        strictEqual((resp as ErrorResponse).error.details, 'sorry idk wtf is going on')
        strictEqual((resp as ErrorResponse).error.resources[0], 'yahoo.edu')
    })

    it('should build resource responses given a resource', async function() {

        // test single resource
        let resource: any = {
            firstName: 'toby',
            lastName: 'the dog'
        };
        let metaData: any = {
            httpCode: '418',
            total: 1,
            isFluffy: true
        }
        
        // check preservation of input values
        let resp: ApiResponse = await build(metaData, resource);
        strictEqual(resp.metadata.httpCode, '418');
        strictEqual(resp.metadata.total, 1);
        strictEqual(resp.metadata.isFluffy, true);
        strictEqual((resp as ResourceResponse).payload.firstName, 'toby');

        // check default behavior
        resp = await build({}, resource);
        strictEqual(resp.metadata.httpCode, '200');
        strictEqual(Object.keys(resp.metadata).length, 1);
        strictEqual((resp as ResourceResponse).payload.firstName, 'toby');

        // test list resource
        let resourceList: any[] = [{
            firstName: 'toby',
            lastName: 'the dog'
        }, {
            firstName: 'pedro',
            lastName: 'el perro'
        }];

        resp = await build({}, resourceList);
        strictEqual(resp.metadata.httpCode, '200');
        strictEqual(Object.keys(resp.metadata).length, 1);
        ok(Array.isArray((resp as ResourceResponse).payload));
        strictEqual((resp as ResourceResponse).payload[0].firstName, 'toby');
    })

})