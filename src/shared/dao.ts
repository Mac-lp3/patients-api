import { getID } from '../shared/hash';
import { ApiError } from '../types/error';
import { patientForms } from '../conf/data';
import { ValidatedInput } from '../types/validation'
import { Patient, PatientInput } from '../types/patient';

/**
 * Patient data access object. Reads patient data from src/conf/data.ts into memory on construction.
 */
export class MemDao {

    private static PATIENTS: Map<string, Patient> = new Map();
    private static NOT_FOUND_ERR_CODE: string = '100'
    private static NOT_UNIQUE_ERR_CODE: string = '101'

    constructor() {

        console.log('Loading in patient data...')

        // read in the dummy data
        patientForms.forEach(post => {
            this.addPatient(post);
        });
    }

    /**
     * Used to get & paginate over all patients unless a search term/filter have been provided.
     * 
     * @param resourceInputs 
     * @param generalInputs ATM only supports query
     * @returns 
     */
    public async findBy(input: ValidatedInput<PatientInput>): Promise<Patient[]> {
        // TODO interfaces for the inputs

        const generalInputs = input.generalInput;
        const resourceInputs = input.resourceInput;

        const term = generalInputs.query ? generalInputs.query.toLowerCase() : false;
        const isFilter = Object.keys(resourceInputs).length > 0 ? true: false;

        let stringToCheck: string;
        let isFilterMatch: boolean = false;
        const resultSet: Patient[] = [];

        MemDao.PATIENTS.forEach((patient) => {

            if (isFilter) {

                // check if patient passes filter
                for (let [key, val] of Object.entries(resourceInputs)) {

                    if ((patient as any)[key] === val) {
                        isFilterMatch = true;
                        break;
                    }
                }

                if (!isFilterMatch) {
                    // go to next if not
                    return;
                }
            }
            
            if (term) {
                
                // check if patient contains term
                stringToCheck = `${patient.firstName}${patient.lastName}${patient.telecom}`.toLowerCase();

                if (!stringToCheck.includes(term)) {
                    // go to next if not
                    return;
                }
            }

            // if we made it this far, all good
            resultSet.push(patient);

            // reset for next patient
            isFilterMatch = false;
        });

        return resultSet;
    }

    public async addPatient(form: PatientInput): Promise<Patient> {
        const generatedID = getID(form);
        
        if(await this.exists(generatedID)) {
            this.throwIt(MemDao.NOT_UNIQUE_ERR_CODE);
        }

        const patient: Patient = {
            id: generatedID,
            firstName: form.firstName as string,
            lastName: form.lastName as string,
            dob: form.dob as string,
            created: new Date().toISOString()
        }

        // check for & set optional fields if found
        form.hasOwnProperty('telecom') ? patient.telecom = form.telecom : true ;
        form.hasOwnProperty('isActive') ? patient.isActive = form.isActive : true ;

        MemDao.PATIENTS.set(generatedID, patient);
        
        return patient;
    }

    public async getPatient(patientID: string): Promise<Patient> {

        if(!await this.exists(patientID)) {
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
    public async putPatient(patientID: string, form: PatientInput): Promise<Patient> {
        if(!await this.exists(patientID)) {
            this.throwIt(MemDao.NOT_FOUND_ERR_CODE);
        }

        // since this may not generate a new ID, remove the current one to prevent an error
        const currentPatient = await this.getPatient(patientID);
        this.deletePatient(patientID);

        let newPatient: Patient;
        try {
            newPatient = await this.addPatient(form);
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
    public async patchPatient(patientID: string, form: PatientInput): Promise<Patient> {
        if(!await this.exists(patientID)) {
            this.throwIt(MemDao.NOT_FOUND_ERR_CODE);
        }

        const currentPatient = await this.getPatient(patientID);

        for(let [key, val] of Object.entries(form)) {

            // validation layer and type definitions ensure this is safe 
            (currentPatient as any)[key] = val
        }

        // regenerate ID in case names/dob changed
        const newID = getID(currentPatient);
        currentPatient.id = newID;

        // replace old ID with new one, just in case.
        await this.deletePatient(patientID);
        MemDao.PATIENTS.set(newID, currentPatient);

        return currentPatient;
    }

    public async exists(patientID: string): Promise<boolean> {
        const exists: boolean = MemDao.PATIENTS.has(patientID);
        return exists;
    }

    public async deletePatient(id: string) {
        MemDao.PATIENTS.delete(id);
    }

    /**
     * General method to get the complete size of the Patients collection, after filters have been applied.
     * This number can be used to populate a UI or help with pagination.
     */
    public async length(input: ValidatedInput<PatientInput>): Promise<number> {

        const generalInputs = input.generalInput;
        const resourceInputs = input.resourceInput;

        const term = generalInputs.query ? generalInputs.query.toLowerCase() : false;
        const isFilter = Object.keys(resourceInputs).length > 0 ? true: false;

        let stringToCheck: string;
        let isFilterMatch: boolean = false;
        let returnLength: number = 0;

        MemDao.PATIENTS.forEach((patient) => {

            if (isFilter) {

                // check if patient passes filter
                for (let [key, val] of Object.entries(resourceInputs)) {

                    if ((patient as any)[key] === val) {
                        isFilterMatch = true;
                        break;
                    }
                }

                if (!isFilterMatch) {
                    // go to next if not
                    return;
                }
            }
            
            if (term) {
                
                // check if patient contains term
                stringToCheck = `${patient.firstName}${patient.lastName}${patient.telecom}`.toLowerCase();

                if (!stringToCheck.includes(term)) {
                    // go to next if not
                    return;
                }
            }

            // if we made it this far, all good
            ++returnLength;

            // reset for next patient
            isFilterMatch = false;
        });

        return returnLength;
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
