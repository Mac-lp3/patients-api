import { ok, strictEqual, notStrictEqual, fail } from 'assert';
import * as validate from '../src/endpoints/patients/validator';

describe('Patients endpoint validation', function() {

    it('should separate general and resource level params', function() {
        
        // get collection test
        let paramsToTest: any = {
            limit: 15,
            offset: 30,
            query: 'Maggie',
            lastName: 'Simpson',
            isActive: true
        };

        let results = validate.queryParams(paramsToTest);

        strictEqual(Object.keys(results.generalInput).length, 3);
        strictEqual(results.generalInput.limit, 15);
        strictEqual(results.generalInput.offset, 30);
        strictEqual(results.generalInput.query, 'Maggie');
        ok(!results.generalInput.hasOwnProperty('lastName'));
        ok(!results.generalInput.hasOwnProperty('isActive'));

        strictEqual(Object.keys(results.resourceInput).length, 2);
        strictEqual(results.resourceInput.lastName, 'Simpson');
        strictEqual(results.resourceInput.isActive, true);
        ok(!results.resourceInput.hasOwnProperty('limit'));
        ok(!results.resourceInput.hasOwnProperty('offset'));
        ok(!results.resourceInput.hasOwnProperty('query'));       

    })

    it('should check for required params', function () {

        // test happy path
        let results: any;
        let paramsToTest: any = {
            firstName: 'Testy',
            lastName: 'McTesterson',
            dob: '2000-01-01'
        };

        try {
            results = validate.postCollectionBody(paramsToTest);
            strictEqual(Object.keys(results.resourceInput).length, 3);
            strictEqual(results.resourceInput.firstName, 'Testy');
        } catch (ex) {
            fail();
        }

        // test sad paths :(
        paramsToTest = {
            firstName: 'Testy',
            lastName: 'McTesterson'
        };
        try {
            results = validate.postCollectionBody(paramsToTest);
            fail();
        } catch (ex) {
            strictEqual(ex.code, '200');
        }

        paramsToTest = {
            firstName: 'Testy',
            dob: '2000-01-01'
        };
        try {
            results = validate.postCollectionBody(paramsToTest);
            fail();
        } catch (ex) {
            strictEqual(ex.code, '200');
        }

        paramsToTest = {
            lastName: 'McTesterson',
            dob: '2000-01-01'
        };
        try {
            results = validate.postCollectionBody(paramsToTest);
            fail();
        } catch (ex) {
            strictEqual(ex.code, '200');
        }
        
    })

    it('should not allow unexpected types', function() {
        
        // get collection test
        let results: any;
        try {
            results = validate.queryParams({ offset: '2021-05-15' });
            fail();
        } catch (ex) {
            strictEqual(ex.code, '200');
        }

        try {
            results = validate.queryParams({ isActive: 'maybe' });
            fail();
        } catch (ex) {
            strictEqual(ex.code, '200');
        }
        
    })

    it('should ignore unused inputs', function() {

        // get collection test
        let paramsToTest = {
            limit: 15,
            isActive: 'true',
            isReturningCharacter: true,
            town: 'Shelbyville'
        };

        let results = validate.queryParams(paramsToTest);
        strictEqual(Object.keys(results.generalInput).length, 1)
        strictEqual(Object.keys(results.resourceInput).length, 1)

    })

    it('should only allow acceptable IDs', function () {
        
    })
    
})