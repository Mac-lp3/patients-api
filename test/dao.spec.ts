import { ok, strictEqual } from 'assert';
import { MemDao } from '../src/shared/dao';
import { getID } from '../src/shared/hash';
import { ApiError } from '../src/types/error';
import { patientForms } from '../src/conf/data';
import { Patient } from '../src/types/patient';

const newGuyForm = {
    firstName: '',
    lastName: '',
    dob: ''
}

describe('memory based dao', function() {

    const dao = new MemDao();

    it('should populate as expected', function() {
        
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

    it('should add unique patients', function() {

    })

    it('should reject non-unique patients', function() {

        patientForms.forEach(pat => {
            try {
                dao.addPatient(patientForms[0]);
                ok(false);
            } catch(ex) {
                strictEqual(
                    (ex as ApiError).summary,
                    'Exception from database layer'
                );
            }
        })

    })

    it('should apply edits to patients', function() {

    })

    it('should fail to edit missing patients', function() {

    })

    it('should query patients as expected', function() {

    })

})