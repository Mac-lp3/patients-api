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

    it('should populate as expected. Should GET by ID as expected.', function() {
        
        let id: string;
        let pat: Patient | undefined;
        
        patientForms.forEach(frm => {
            id = getID(frm);
            pat = dao.getPatient(id);

            strictEqual(id, pat.id);
            strictEqual(frm.firstName, pat.firstName);
            strictEqual(frm.lastName, pat.lastName);
            strictEqual(frm.dob, pat.dob);

            ok(pat.created);
            pat = undefined;
        })
    })

    it('should error when ID is not found', function() {

        try {
            dao.getPatient('lol idk');
            ok(false);
        } catch (ex) {
            strictEqual((ex as ApiError).code, '100');
        }

        try {
            dao.putPatient('lol idk', newPatientForm);
            ok(false);
        } catch (ex) {
            strictEqual((ex as ApiError).code, '100');
        }

        try {
            dao.patchPatient('lol idk', newPatientForm);
            ok(false);
        } catch (ex) {
            strictEqual((ex as ApiError).code, '100');
        }
    })

    it('should add unique patients', function() {

        const id = getID(newPatientForm);

        ok(!dao.exists(id));

        const newPat = dao.addPatient(newPatientForm);

        ok(dao.exists(newPat.id));
        ok(newPat.created);
        strictEqual(newPat.telecom, newPatientForm.telecom);

    })

    it('should reject non-unique patients', function() {

        patientForms.forEach(pat => {
            try {
                dao.addPatient(patientForms[0]);
                ok(false);
            } catch(ex) {
                strictEqual((ex as ApiError).code, '101');
            }
        })

    })

    it('should PATCH patients as expected', function() {

        // Test w/ property that does NOT change ID
        let testID = getID(patientForms[0]);
        let testPatient = dao.getPatient(testID);

        ok(!testPatient.hasOwnProperty('telecom'));

        let testPatch: PatientPatch = {
            telecom: '09090909'
        }
        testPatient = dao.patchPatient(testID, testPatch);

        ok(testPatient.hasOwnProperty('telecom'));
        strictEqual(testID, testPatient.id);

        // Test w/ property that DOES change ID
        ok(testPatient.lastName !== 'Smithers');
        testPatch = {
            lastName: 'Smithers'
        }
        testPatient = dao.patchPatient(testID, testPatch);

        ok(testPatient.lastName === 'Smithers');
        ok(testID !== testPatient.id);
        ok(!dao.exists(testID));
        ok(dao.exists(testPatient.id));

    })

    it('should PUT patients as expected', function() {

        // test with non-id related properties
        const id = getID(newPatientForm);

        // assumes this test runs after the add patient ones
        let testPat = dao.getPatient(id);

        (newPatientForm as any).isActive = true;
        let newPat = dao.putPatient(id, newPatientForm);

        strictEqual(testPat.id, newPat.id);
        ok(newPat.hasOwnProperty('isActive'));
        ok(!testPat.hasOwnProperty('isActive'));

        // test with id related properties
        newPatientForm.firstName = 'Sideshow';
        newPatientForm.lastName = 'Bob';

        newPat = dao.putPatient(id, newPatientForm);

        ok(!dao.exists(id));
        ok(dao.exists(newPat.id));
        notStrictEqual(newPat.id, testPat.id);
        notStrictEqual(newPat.firstName, testPat.firstName);
        strictEqual(newPat.firstName, newPatientForm.firstName);

    })

    it('should query patients as expected', function() {

        const queryTestForm1 = {
            firstName: 'Bart',
            lastName: 'Simpson',
            dob: '1995',
            telecom: '8675309'
        }
        let patient = dao.addPatient(queryTestForm1);

        // test just filter
        let queryResults = dao.query({ firstName: 'Bart' });
        strictEqual(queryResults.length, 1);
        strictEqual(queryResults[0].firstName, 'Bart');
        strictEqual(queryResults[0].id, patient.id);

        // test just for term
        queryResults = dao.query('Bart');
        strictEqual(queryResults.length, 1);
        strictEqual(queryResults[0].firstName, 'Bart');
        strictEqual(queryResults[0].id, patient.id);

        // ensure the term can get multiple results
        dao.addPatient({
            firstName: 'Lisa',
            lastName: 'Simpson',
            dob: '1997',
            telecom: '8675309'
        });
        queryResults = dao.query('Simpson');
        strictEqual(queryResults.length, 2);
        strictEqual(queryResults[0].firstName, 'Bart');
        strictEqual(queryResults[1].firstName, 'Lisa');

        // test both filter and term
        queryResults = dao.query({ lastName: 'Simpson' });
        strictEqual(queryResults.length, 2);
        queryResults = dao.query('Bart', { lastName: 'Simpson' });
        strictEqual(queryResults.length, 1);
        strictEqual(queryResults[0].firstName, 'Bart');

    })

})