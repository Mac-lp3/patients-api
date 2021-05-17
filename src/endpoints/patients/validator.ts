import { ApiError } from '../../types/error';

function tryToString(value: any) {
    return String(value);
}

function tryToNumber(value: any) {
    const conv = Number(value);
    if (isNaN(conv)) { 
        throw `Value: ${value} Expected type: number.`
    }
    return conv;
}

function tryToBoolean(value: any) {
    if (typeof value !== 'boolean') {
        const lowerVal = value.toLowerCase();
        if (lowerVal !== 'true' && lowerVal !== 'false') {
            throw `Value: ${value} Expected type: boolean.`
        }
    }
    return Boolean(value);
}

const generalParamList = [{
    name: 'limit',
    type: 'number',
    toType: tryToNumber
}, {
    name: 'offset',
    type: 'number',
    toType: tryToNumber
}, {
    name: 'query',
    type: 'string',
    toType: tryToString
}];

const getPatientParamList = [{
    name: 'firstName',
    type: 'string',
    toType: tryToString
}, {
    name: 'lastName',
    type: 'string',
    toType: tryToString
}, {
    name: 'dob',
    type: 'string',
    toType: tryToString
}, {
    name: 'telecom',
    type: 'string',
    toType: tryToString
}, {
    name: 'isActive',
    type: 'boolean',
    toType: tryToBoolean
}]

export function getPatientCollection(params: any) {

    const generalInputObject: any = {};
    const patientInputObject: any = {};

    let propToCheck: string = '';
    let propType: string = '';

    try {

        // build/extract the general params
        generalParamList.forEach(param => {

            if (params.hasOwnProperty(param.name)) {
                propType = param.type;
                propToCheck = param.name;
                generalInputObject[param.name] = param.toType(params[param.name]);
            }
        });

        // build/extract patient-specific params
        getPatientParamList.forEach(param => {

            if (params.hasOwnProperty(param.name)) {
                propType = param.type;
                propToCheck = param.name;
                patientInputObject[param.name] = param.toType(params[param.name]);
            }
        });

    } catch (ex) {

        // create error object and bubble up
        const er: ApiError = {
            code: '200',
            details: `Cannot convert ${propToCheck} to type ${propType}.`,
            resources: []
        }
        throw er;
    }

    // TODO interfaces for these
    return {
        generalInput: generalInputObject,
        resourceInput: patientInputObject
    }
    
}

const postPatientParamList = [{
    name: 'firstName',
    type: 'string',
    toType: tryToString
}, {
    name: 'lastName',
    type: 'string',
    toType: tryToString
}, {
    name: 'dob',
    type: 'string',
    toType: tryToString
}, {
    name: 'telecom',
    type: 'string',
    toType: tryToString
}, {
    name: 'isActive',
    type: 'boolean',
    toType: tryToBoolean
}]

export function postPatientCollection(params: any) {
    return {};
}