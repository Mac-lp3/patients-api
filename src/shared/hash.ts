import { createHash } from 'crypto';
import { PatientInput } from '../types/patient';

const ID_LENGTH = 7;

export function getID(patientForm: PatientInput): string;
export function getID(firstName: string, lastName: string, dob: string): string;

/**
 * Generates a hash string for this patient based on the firstName, lastName, and dob.
 * 
 * @param formOrFirstName Either an object containing the required fields, or the firstname
 * @param lastName Only required if firstName is provided rather than an object.
 * @param dob Only required if firstName is provided rather than an object.
 * @returns A 7 character hash created from the provided strings.
 */
export function getID(formOrFirstName: string | PatientInput, lastName?: string, dob?: string): string {

    // get value of first name, depending on input
    let fn: string;
    let ln: string;
    let db: string;

    if (lastName === undefined) {

        // safe as form should have been validated before this
        fn = (formOrFirstName as PatientInput).firstName as string;
        ln = (formOrFirstName as PatientInput).lastName as string;
        db = (formOrFirstName as PatientInput).dob as string;

    } else {

        fn = formOrFirstName as string;
        ln = lastName as string;
        db = dob as string;

    }

    // generate and return hash
    const data = `${fn}${ln}${db}`;
    const md5Hex = createHash('md5').update(data).digest('hex').substring(0, ID_LENGTH);

    return md5Hex;
}
