/**
 * This script defines and exports the functions that validate user input.
 * 
 * Though the same fields are used on multiple endpoints, some fields are required by certain
 * opertaions, and optional for others.
 * 
 * Thus, some operations have a parameter list, which defines the name, expected type, required
 * or not, and a function that attempts to convert the value into its expected type.
 * 
 * If any required fields are missing or cannot be converted to the expected type, an exception
 * is thrown.
 */
import { PatientInput } from '../../types/patient'
import { ValidatedInput, GeneralQueryInput } from '../../types/validation';
import { ApiError, RequiredInputError, TypeValidationError } from '../../types/error';

// function to convert the value to string
function tryToString(value: any) {
    // TODO general illegal characters
    return String(value);
}

// function to convert the value to a number
function tryToNumber(value: any) {
    const conv = Number(value);
    if (isNaN(conv)) {
        throw new TypeValidationError('');
    }
    return conv;
}

// function and convert the value to a boolean.
function tryToBoolean(value: any) {
    if (typeof value !== 'boolean') {
        const lowerVal = value.toLowerCase();
        if (lowerVal !== 'true' && lowerVal !== 'false') {
            throw new TypeValidationError('');
        }
    }
    return Boolean(value);
}

// list of query params suppored by all resources 
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

// Patient specific query parameters
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

// Fields used by Patient PUT/POST operations
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

// Fields used by Patient PATCH operations
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

/**
 * Checks the request against general and patient specific query param lists.
 * @param params The query parameters on the request.
 * @returns An object containing the validated/converted general and patient specific params.
 */
export function queryParams(params: any): ValidatedInput<PatientInput> {

    // Ok for these to be null with GET requests
    let patientInputObject: PatientInput = {};
    let generalInputObject: GeneralQueryInput = {};

    if ( params && Object.keys(params).length > 0 ) {
        patientInputObject = checkNamesAndTypes(queryParamList, params);
        generalInputObject = checkNamesAndTypes(generalParamList, params);
    }

    return {
        generalInput: generalInputObject,
        resourceInput: patientInputObject
    }
    
}

/**
 * Checks the request against the Patient POST/PUT param list.
 * @param params The body of the request.
 * @returns 
 */
export function postCollectionBody(params: any): ValidatedInput<PatientInput> {

    const daoInput: PatientInput = checkNamesAndTypes(postAndPutBodyParamList, params);

    return {
        generalInput: {},
        resourceInput: daoInput
    }
}

/**
 * Checks the request against the Patient PATCH param list
 * @param params 
 * @returns 
 */
export function patchInstanceBody(params: any): ValidatedInput<PatientInput> {

    const daoInput: PatientInput = checkNamesAndTypes(patchBodyParamList, params);

    return {
        generalInput: {},
        resourceInput: daoInput
    }
}

/**
 * Checks the request against the Patient POST/PUT param list
 * @param params 
 * @returns 
 */
export function putInstanceBody(params: any): ValidatedInput<PatientInput> {

    const daoInput = checkNamesAndTypes(postAndPutBodyParamList, params);

    return {
        generalInput: {},
        resourceInput: daoInput
    }
}

/**
 * Throws an exception if the given ID does not conform to expected format.
 * @param patientID The Patient id to validate
 */
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

/**
 * General function to loop over a param list and apply the rules to the input object
 * @param paramList One of the defined parameter lists
 * @param userParams The input object being validated
 * @returns A new object containing only the expected values that passed validation.
 */
function checkNamesAndTypes(paramList: any[], userParams: any) {

    const inputObject: any = {};

    let propToCheck: string = '';
    let propType: string = '';

    try {

        // build/extract the general params
        paramList.forEach(param => {

            if (userParams?.hasOwnProperty(param.name)) {
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
        throw new ApiError('200', details, []);

    }

    return inputObject;

}
