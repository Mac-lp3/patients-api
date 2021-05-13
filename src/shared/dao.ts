import { Patient } from '../types/patient';

const patientsData: Patient[] = [];

export class FileDao {
    private static PATIENTS: Patient[] = patientsData;
}

