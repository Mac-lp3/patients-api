export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    dob: string;
    created: string;
    telecom?: string;
    isActive?: boolean;
}

export interface PatientPost {
    firstName: string;
    lastName: string;
    dob: string;
    telecom?: string;
    isActive?: boolean;
}

export interface PatientPatch {
    firstName?: string;
    lastName?: string;
    dob?: string;
    telecom?: string;
    isActive?: boolean;
}

export interface PatientPut {
    firstName: string;
    lastName: string;
    dob: string;
    telecom?: string;
    isActive?: boolean;
}

// separate object for the page/general params?
//  easy way to manage general params/options
// pass that in as input 1?
