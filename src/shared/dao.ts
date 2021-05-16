import { getID } from '../shared/hash';
import { ApiError } from '../types/error';
import { patientForms } from '../conf/data';
import { Patient, PatientPost, PatientPut, PatientPatch } from '../types/patient';

/**
 * Patient data access object. Reads patient data from src/conf/data.ts into memory on construction.
 */
export class MemDao {

    private static PATIENTS: Map<string, Patient> = new Map();
    private static NOT_FOUND_ERR_CODE: string = '100'
    private static NOT_UNIQUE_ERR_CODE: string = '101'

    constructor() {
        // read in the dummy data
        patientForms.forEach(post => {
            this.addPatient(post);
        });
    }

    public query(term: string): Patient[];
    public query(filter: PatientPatch): Patient[];
    public query(term: string, filter: PatientPatch): Patient[];
    public query(termOrFilter: string | PatientPatch, filter?: PatientPatch): Patient[] {


        let term: string;
        let isTerm: boolean;
        let isFilter: boolean;

        // apply just a search term, filter, or both?
        if(typeof termOrFilter === 'string') {
            term = termOrFilter;
            if(filter === undefined) {
                isTerm = true
                isFilter = false;
            } else {
                isTerm = true
                isFilter = true;
            }
        } else {
            isTerm = false
            isFilter = true;
            filter = termOrFilter;
        }

        // search for patients that match the criteria
        let filterMatch: boolean;
        let stringToCheck: string;
        const resultSet: Patient[] = [];

        MemDao.PATIENTS.forEach((patient) => {

            if (isFilter) {

                // check if patient passes filter
                for (let [key, val] of Object.entries(filter as PatientPatch)) {

                    if ((patient as any)[key] === val) {
                        filterMatch = true;
                        break;
                    }
                }

                if (!filterMatch) {
                    // go to next if not
                    return;
                }
            }
            
            if (isTerm) {
                
                // check if patient contains term
                stringToCheck = `${patient.firstName}${patient.lastName}${patient.telecom}`
                if (!stringToCheck.toLowerCase().includes((term as string).toLowerCase())) {
                    // go to next if not
                    return;
                }
            }

            // if we made it this far, all good
            resultSet.push(patient);

            // reset for next patient
            filterMatch = false;
        });

        return resultSet;
    }

    public addPatient(form: PatientPost): Patient {
        const generatedID = getID(form);
        
        if(this.exists(generatedID)) {
            this.throwIt(MemDao.NOT_UNIQUE_ERR_CODE);
        }

        const patient: Patient = {
            id: generatedID,
            firstName: form.firstName,
            lastName: form.lastName,
            dob: form.dob,
            created: new Date().toISOString()
        }

        // check for & set optional fields if found
        form.hasOwnProperty('telecom') ? patient.telecom = form.telecom : true ;
        form.hasOwnProperty('isActive') ? patient.isActive = form.isActive : true ;

        MemDao.PATIENTS.set(generatedID, patient);
        
        return patient;
    }

    public getPatient(patientID: string): Patient {

        if(!this.exists(patientID)) {
            this.throwIt(MemDao.NOT_FOUND_ERR_CODE);
        }

        const patient = MemDao.PATIENTS.get(patientID) as Patient;

        return patient;
    }

    /**
     * Used to completely replace a Patient, rather than editing 1 or more properties (PATCH).
     * 
     * Note that if a new lastName, firstName, or DoB is provided, the new Patient will have a new ID.
     * 
     * @param patientID 
     * @param form 
     * @returns The updated Patient object, potentially with a new ID
     */
    public putPatient(patientID: string, form: PatientPut): Patient {
        if(!this.exists(patientID)) {
            this.throwIt(MemDao.NOT_FOUND_ERR_CODE);
        }

        // since this may not generate a new ID, remove the current one to prevent an error
        const currentPatient = this.getPatient(patientID);
        this.deletePatient(patientID);

        let newPatient: Patient;
        try {
            newPatient = this.addPatient(form);
        } catch(ex) {
            // replace the old patient
            this.addPatient(currentPatient);
            throw ex;
        }

        return newPatient;
    }

    /**
     * Used to replace/add a single property on a Patient, rather than a full overwrite (PUT).
     * 
     * Note that if a new lastName, firstName, or DoB is provided, the Patient will have a new ID.
     * 
     * @param patientID 
     * @param form 
     * @returns the updated Patient object, potentially with a new ID
     */
    public patchPatient(patientID: string, form: PatientPatch): Patient {
        if(!this.exists(patientID)) {
            this.throwIt(MemDao.NOT_FOUND_ERR_CODE);
        }

        const currentPatient = this.getPatient(patientID);

        for(let [key, val] of Object.entries(form)) {

            // validation layer and type definitions ensure this is safe 
            (currentPatient as any)[key] = val
        }

        // regenerate ID in case names/dob changed
        const newID = getID(currentPatient);
        currentPatient.id = newID;

        // replace old ID with new one, just in case.
        this.deletePatient(patientID);
        MemDao.PATIENTS.set(newID, currentPatient);

        return currentPatient;
    }

    public exists(patientID: string): boolean {
        return MemDao.PATIENTS.has(patientID);
    }

    public deletePatient(id: string) {
        MemDao.PATIENTS.delete(id);
    }

    private throwIt(errorCode: string, resrc?: string[]) {

        const er: ApiError = {
            code: errorCode,
            details: '',
            resources: resrc ? resrc : []
        };

        throw er;
    }
}
