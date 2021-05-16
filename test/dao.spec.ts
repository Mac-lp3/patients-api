import { MemDao } from '../src/shared/dao';
import { getID } from '../src/shared/hash';
import { ApiError } from '../src/types/error';
import { patientForms } from '../src/conf/data';
import { ok, strictEqual, notStrictEqual } from 'assert';
import { Patient, PatientPatch } from '../src/types/patient';
import { strict } from 'assert/strict';

const newPatientForm = {
    firstName: 'Lisa',
    lastName: 'Simpson',
    dob: '1997',
    telecom: '8675309'
}

const dao = new MemDao();

describe('memory based dao', function() {

    it('should populate as expected. Should GET by ID as expected.', async function() {
        
        let id: string;
        let pat: Patient | undefined;
        
        patientForms.forEach(async frm => {
            id = getID(frm);
            pat = await dao.getPatient(id);

            strictEqual(id, pat.id);
            strictEqual(frm.firstName, pat.firstName);
            strictEqual(frm.lastName, pat.lastName);
            strictEqual(frm.dob, pat.dob);

            ok(pat.created);
            pat = undefined;
        })
    })

    it('should error when ID is not found', async function() {

        try {
            await dao.getPatient('lol idk');
            ok(false);
        } catch (ex) {
            strictEqual((ex as ApiError).code, '100');
        }

        try {
            await dao.putPatient('lol idk', newPatientForm);
            ok(false);
        } catch (ex) {
            strictEqual((ex as ApiError).code, '100');
        }

        try {
            await dao.patchPatient('lol idk', newPatientForm);
            ok(false);
        } catch (ex) {
            strictEqual((ex as ApiError).code, '100');
        }
    })

    it('should add unique patients', async function() {

        const id = getID(newPatientForm);
        let exists = await dao.exists(id);
        ok(!exists);

        const newPat = await dao.addPatient(newPatientForm);

        exists = await dao.exists(newPat.id);
        ok(exists);
        ok(newPat.created);
        strictEqual(newPat.telecom, newPatientForm.telecom);

    })

    it('should reject non-unique patients', async function() {

        patientForms.forEach(async pat => {
            try {
                await dao.addPatient(patientForms[0]);
                ok(false);
            } catch(ex) {
                strictEqual((ex as ApiError).code, '101');
            }
        })

    })

    it('should PATCH patients as expected', async function() {

        // Test w/ property that does NOT change ID
        let testID = getID(patientForms[0]);
        let testPatient = await dao.getPatient(testID);

        ok(!testPatient.hasOwnProperty('telecom'));

        let testPatch: PatientPatch = {
            telecom: '09090909'
        }
        testPatient = await dao.patchPatient(testID, testPatch);

        ok(testPatient.hasOwnProperty('telecom'));
        strictEqual(testID, testPatient.id);

        // Test w/ property that DOES change ID
        ok(testPatient.lastName !== 'Smithers');
        testPatch = {
            lastName: 'Smithers'
        }
        testPatient = await dao.patchPatient(testID, testPatch);

        ok(testPatient.lastName === 'Smithers');
        ok(testID !== testPatient.id);
        ok(!await dao.exists(testID));
        ok(await dao.exists(testPatient.id));

    })

    it('should PUT patients as expected', async function() {

        // test with non-id related properties
        const id = getID(newPatientForm);

        // assumes this test runs after the add patient ones
        let testPat = await dao.getPatient(id);

        (newPatientForm as any).isActive = true;
        let newPat = await dao.putPatient(id, newPatientForm);

        strictEqual(testPat.id, newPat.id);
        ok(newPat.hasOwnProperty('isActive'));
        ok(!testPat.hasOwnProperty('isActive'));

        // test with id related properties
        newPatientForm.firstName = 'Sideshow';
        newPatientForm.lastName = 'Bob';

        newPat = await dao.putPatient(id, newPatientForm);

        ok(!await dao.exists(id));
        ok(await dao.exists(newPat.id));
        notStrictEqual(newPat.id, testPat.id);
        notStrictEqual(newPat.firstName, testPat.firstName);
        strictEqual(newPat.firstName, newPatientForm.firstName);

    })

    it('should query patients as expected', async function() {

        const queryTestForm1 = {
            firstName: 'Bart',
            lastName: 'Simpson',
            dob: '1995',
            telecom: '8675309'
        }
        let patient = await dao.addPatient(queryTestForm1);

        // test just filter
        let queryResults = await dao.query({ firstName: 'Bart' });
        let count = await dao.length({ firstName: 'Bart' });
        strictEqual(count, 1);
        strictEqual(queryResults.length, 1);
        strictEqual(queryResults[0].firstName, 'Bart');
        strictEqual(queryResults[0].id, patient.id);

        // test just for term
        queryResults = await dao.query('Bart');
        count = await dao.length('Bart');
        strictEqual(count, 1);
        strictEqual(queryResults.length, 1);
        strictEqual(queryResults[0].firstName, 'Bart');
        strictEqual(queryResults[0].id, patient.id);

        // ensure the term can get multiple results
        await dao.addPatient({
            firstName: 'Lisa',
            lastName: 'Simpson',
            dob: '1997',
            telecom: '8675309'
        });
        queryResults = await dao.query('Simpson');
        count = await dao.length('Simpson');
        strictEqual(count, 2);
        strictEqual(queryResults.length, 2);
        strictEqual(queryResults[0].firstName, 'Bart');
        strictEqual(queryResults[1].firstName, 'Lisa');

        // test both filter and term
        queryResults = await dao.query({ lastName: 'Simpson' });
        strictEqual(queryResults.length, 2);
        queryResults = await dao.query('Bart', { lastName: 'Simpson' });
        strictEqual(queryResults.length, 1);
        strictEqual(queryResults[0].firstName, 'Bart');

    })

})