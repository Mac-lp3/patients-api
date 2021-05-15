import { getID } from '../shared/hash';
import { ApiError } from '../types/error';
import { patientForms } from '../conf/data';
import { Patient, PatientPost, PatientPut, PatientPatch } from '../types/patient';

export class MemDao {

    private static PATIENTS: Map<string, Patient> = new Map();
    
    private static ERR_SUMMARY: string = 'Exception from database layer';
    private static NOT_FOUND_ERR_MSG: string = 'Could not find a patient with the provided ID.'
    private static NOT_UNIQUE_ERR_MSG: string = 'Provided firstName, lastName, and DoB did not produce a unique hash. Change either property a bit more.'

    constructor() {
        patientForms.forEach(post => {
            this.addPatient(post);
        });
    }

    public addPatient(form: PatientPost): Patient {
        const generatedID = getID(form);
        
        if(this.exists(generatedID)) {
            this.throwIt(MemDao.NOT_UNIQUE_ERR_MSG);
        }

        const patient: Patient = {
            id: generatedID,
            firstName: form.firstName,
            lastName: form.lastName,
            dob: form.dob,
            created: new Date().toISOString()
        }

        MemDao.PATIENTS.set(generatedID, patient);
        
        return patient;
    }

    public getPatient(patientID: string): Patient {

        if(!this.exists(patientID)) {
            this.throwIt(MemDao.NOT_FOUND_ERR_MSG);
        }

        const patient = MemDao.PATIENTS.get(patientID) as Patient;

        return patient;
    }

    public editPatient(form: PatientPut | PatientPatch): Patient {
        return {} as Patient;
    }

    public exists(patientID: string): boolean {
        return MemDao.PATIENTS.has(patientID);
    }

    public deletePatient(id: string) {}

    private throwIt(message: string, resrc?: string[]) {

        const er: ApiError = {
            summary: MemDao.ERR_SUMMARY,
            details: message,
            resources: resrc ? resrc : []
        };

        throw er;
        
    }
}

