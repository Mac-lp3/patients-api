import { ResourceInput } from './validation';

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    dob: string;
    created: string;
    telecom?: string;
    isActive?: boolean;
}

export interface PatientInput extends ResourceInput {
    firstName?: string;
    lastName?: string;
    dob?: string;
    telecom?: string;
    isActive?: boolean;
}
