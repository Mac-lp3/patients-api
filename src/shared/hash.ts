import { createHash } from 'crypto';
import { PatientPut, PatientPost } from '../types/patient';

const ID_LENGTH = 7;

// overload signatures
export function getID(patientForm: PatientPut | PatientPost): string;
export function getID(firstName: string, lastName: string, dob: string): string;
export function getID(formOrFirstName: string | PatientPut | PatientPost, lastName?: string, dob?: string): string {

    // get value of first name, depending on input
    let fn: string;
    let ln: string;
    let db: string;
    if (lastName === undefined) {

        fn = (formOrFirstName as PatientPut | PatientPost).firstName;
        ln = (formOrFirstName as PatientPut | PatientPost).lastName;
        db = (formOrFirstName as PatientPut | PatientPost).dob;

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
