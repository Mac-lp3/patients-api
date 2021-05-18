import { PatientInput } from '../../types/patient'
import { ValidatedInput, GeneralQueryInput } from '../../types/validation';
import { ApiError, RequiredInputError, TypeValidationError } from '../../types/error';

function tryToString(value: any) {
    return String(value);
}

function tryToNumber(value: any) {
    const conv = Number(value);
    if (isNaN(conv)) {
        throw new TypeValidationError('');
    }
    return conv;
}

function tryToBoolean(value: any) {
    if (typeof value !== 'boolean') {
        const lowerVal = value.toLowerCase();
        if (lowerVal !== 'true' && lowerVal !== 'false') {
            throw new TypeValidationError('');
        }
    }
    return Boolean(value);
}

const generalParamList = [{
    name: 'limit',
    isRequired: false,
    type: 'number',
    toType: tryToNumber
}, {
    name: 'offset',
    isRequired: false,
    type: 'number',
    toType: tryToNumber
}, {
    name: 'query',
    isRequired: false,
    type: 'string',
    toType: tryToString
}];

const queryParamList = [{
    name: 'firstName',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'lastName',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'dob',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'telecom',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'isActive',
    isRequired: false,
    type: 'boolean',
    toType: tryToBoolean
}]

const postAndPutBodyParamList = [{
    name: 'firstName',
    isRequired: true,
    type: 'string',
    toType: tryToString
}, {
    name: 'lastName',
    isRequired: true,
    type: 'string',
    toType: tryToString
}, {
    name: 'dob',
    isRequired: true,
    type: 'string',
    toType: tryToString
}, {
    name: 'telecom',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'isActive',
    isRequired: false,
    type: 'boolean',
    toType: tryToBoolean
}]

const patchBodyParamList = [{
    name: 'firstName',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'lastName',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'dob',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'telecom',
    isRequired: false,
    type: 'string',
    toType: tryToString
}, {
    name: 'isActive',
    isRequired: false,
    type: 'boolean',
    toType: tryToBoolean
}]

export function queryParams(params: any): ValidatedInput<PatientInput> {

    // Ok for these to be null with GET requests
    let patientInputObject: PatientInput = {};
    let generalInputObject: GeneralQueryInput = {};

    // null check
    if ( params && Object.keys(params).length > 0 ) {
        patientInputObject = checkNamesAndTypes(queryParamList, params);
        generalInputObject = checkNamesAndTypes(generalParamList, params);
    }

    return {
        generalInput: generalInputObject,
        resourceInput: patientInputObject
    }
    
}

export function postCollectionBody(params: any): ValidatedInput<PatientInput> {

    const daoInput: PatientInput = checkNamesAndTypes(postAndPutBodyParamList, params);

    return {
        generalInput: {},
        resourceInput: daoInput
    }
}

export function patchInstanceBody(params: any): ValidatedInput<PatientInput> {

    const daoInput: PatientInput = checkNamesAndTypes(patchBodyParamList, params);

    return {
        generalInput: {},
        resourceInput: daoInput
    }
}

export function putInstanceBody(params: any): ValidatedInput<PatientInput> {

    const daoInput = checkNamesAndTypes(postAndPutBodyParamList, params);

    return {
        generalInput: {},
        resourceInput: daoInput
    }
}

export function patientID(patientID: string) {

    let errDetails: string | undefined;
    if (patientID?.length !== 7) {
        errDetails = `IDs must be exactly 7 characters. Found ${patientID?.length}.`
    } else if (!/^[a-f0-9]{7}$/.test(patientID)) {
        errDetails = `Given ID contains illegal characters. Only 0-9 and a-f are allowed.`
    }

    if (errDetails) {
        throw new ApiError('201', errDetails, []);
    }
}

function checkNamesAndTypes(paramList: any[], userParams: any) {

    const inputObject: any = {};

    let propToCheck: string = '';
    let propType: string = '';

    try {

        // build/extract the general params
        paramList.forEach(param => {

            if (userParams.hasOwnProperty(param.name)) {
                propType = param.type;
                propToCheck = param.name;
                inputObject[param.name] = param.toType(userParams[param.name]);
            } else if (param.isRequired) {
                throw new RequiredInputError(`Required parameter ${param.name} was not found in this request`);
            }

        });

    } catch (ex) {

        let details: string;

        if (ex.constructor.name === 'TypeValidationError') {
            details = `Cannot convert ${propToCheck} to type ${propType}. Value: ${userParams[propToCheck]}`;
        } else if (ex.constructor.name === 'RequiredInputError') {
            details = ex.details;
        } else {
            // unknown error
            throw ex;
        }

        // create error object and bubble up
        const er: ApiError = {
            code: '200',
            details: details,
            resources: []
        }
        throw er;
    }

    return inputObject;

}
