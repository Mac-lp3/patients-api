import { ok, strictEqual, notStrictEqual, fail } from 'assert';
import { ApiResponse, ErrorResponse, ResourceResponse } from '../src/types/response';
import { getPatientInstance, patchPatientInstance, putPatientInstance, deletePatientInstance } from '../src/endpoints/patients/handlers';

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

    it('should patch non-id fields as expected', async function() {

        let req: any = { 
            params: { patientID: '55dd138' },
            payload: { isActive: false }
        };

        let guinea = await getPatientInstance(req);
        
        strictEqual((guinea as ResourceResponse).payload.id, '55dd138');
        ok(!(guinea as ResourceResponse).payload.hasOwnProperty('isActive'));
        strictEqual(Object.keys((guinea as ResourceResponse).payload).length, 5)

        let newGuinea = await patchPatientInstance(req);
        strictEqual(newGuinea.metadata.httpCode, '200');
        strictEqual((newGuinea as ResourceResponse).payload.id, '55dd138');
        ok((newGuinea as ResourceResponse).payload.hasOwnProperty('isActive'));
        strictEqual(Object.keys((newGuinea as ResourceResponse).payload).length, 6);

        // test some bad IDs
        req = { 
            params: { patientID: '0000000' },
            payload: { isActive: false }
        };
        guinea = await getPatientInstance(req);
        strictEqual(guinea.metadata.httpCode, '404')
        ok((guinea as ErrorResponse).error.hasOwnProperty('details'));

        req = { 
            params: { patientID: 'XXXXXXX' },
            payload: { isActive: false }
        };
        guinea = await getPatientInstance(req);
        strictEqual(guinea.metadata.httpCode, '400')
        ok((guinea as ErrorResponse).error.hasOwnProperty('details'));
    })

    it('should patch ID fields as expected', async function() {

        let req: any = { 
            params: { patientID: 'f8071a6' },
            payload: { firstName: 'Troyy' }
        };

        let guinea = await getPatientInstance(req);
        strictEqual((guinea as ResourceResponse).payload.id, 'f8071a6');

        let newGuinea = await patchPatientInstance(req);
        strictEqual(newGuinea.metadata.httpCode, '200');
        strictEqual((newGuinea as ResourceResponse).payload.id, 'bf550d0');
        strictEqual(
            (guinea as ResourceResponse).payload.created,
            (newGuinea as ResourceResponse).payload.created
        );

    })

    it('should work if the ID fields are provided', async function() {
        
        // GET and check before
        let req: any = { 
            params: { patientID: '2799f58' },
            payload: {}
        };
        let guinea = await getPatientInstance(req);

        strictEqual((guinea as ResourceResponse).payload.id, '2799f58');
        strictEqual((guinea as ResourceResponse).payload.dob, '1966-07-16');
        strictEqual((guinea as ResourceResponse).payload.firstName, 'Willie');
        strictEqual((guinea as ResourceResponse).payload.lastName, 'Grounds-Keeper');
        ok((guinea as ResourceResponse).payload.hasOwnProperty('isActive'));

        // PUT and check after
        req.payload.firstName = 'Willie';
        req.payload.lastName = 'GroundsKeeper';
        req.payload.dob = '1965-01-01';

        let newGuinea = await putPatientInstance(req);

        strictEqual(newGuinea.metadata.httpCode, '201');
        strictEqual((newGuinea as ResourceResponse).payload.id, '1d8771c');
        strictEqual((newGuinea as ResourceResponse).payload.dob, '1965-01-01');
        strictEqual((newGuinea as ResourceResponse).payload.firstName, 'Willie');
        strictEqual((newGuinea as ResourceResponse).payload.lastName, 'GroundsKeeper');
        ok(!(newGuinea as ResourceResponse).payload.hasOwnProperty('isActive'));
    })

    it('should fail if the ID fields are not provided', async function() {
        let req: any = { 
            params: { patientID: '16104ab' },
            payload: {}
        };
        let guinea = await putPatientInstance(req);

        strictEqual(guinea.metadata.httpCode, '400');
        ok((guinea as ErrorResponse).error.hasOwnProperty('summary'));
        ok((guinea as ErrorResponse).error.hasOwnProperty('details'));
        ok((guinea as ErrorResponse).error.hasOwnProperty('resources'));
    })

    it('should delete existing patients', async function() {

        let req: any = { 
            params: { patientID: '16104ab' },
            payload: {}
        };

        let guinea = await getPatientInstance(req);
        strictEqual(guinea.metadata.httpCode, '200');

        guinea = await deletePatientInstance(req);
        strictEqual(guinea.metadata.httpCode, '204');

        guinea = await getPatientInstance(req);
        strictEqual(guinea.metadata.httpCode, '404');

        guinea = await deletePatientInstance(req);
        strictEqual(guinea.metadata.httpCode, '404');

    })

});