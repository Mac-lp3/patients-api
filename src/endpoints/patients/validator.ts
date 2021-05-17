const generalParamList = [{
    name: 'limit',
    toType: (x: any) => Number(x)
}, {
    name: 'offset',
    toType: (x: any) => Number(x)
}, {
    name: 'query',
    toType: (x: any) => String(x)
}];

const getPatientParamList = [{
    name: 'firstName',
    toType: (x: any) => String(x)
}, {
    name: 'lastName',
    toType: (x: any) => String(x)
}, {
    name: 'dob',
    toType: (x: any) => String(x)
}, {
    name: 'telecom',
    toType: (x: any) => String(x)
}, {
    name: 'isActive',
    toType: (x: any) => Boolean(x)
}, {
    name: 'query',
    toType: (x: any) => String(x)
}]

export function getPatientCollection(params: any) {

    const generalInputObject: any = {};
    const patientInputObject: any = {};

    try {
        // build/extract the general params
        generalParamList.forEach(param => {

            if (params.hasOwnProperty(param.name)) {
                generalInputObject[param.name] = param.toType(params[param.name]);
            }
        });

        // build/extract patient-specific params
        getPatientParamList.forEach(param => {

            if (params.hasOwnProperty(param.name)) {
                patientInputObject[param.name] = param.toType(params[param.name]);
            }
        });

    } catch (ex) {
        // TODO create and bubble up
    }

    // TODO standardize more?
    return {
        generalInput: generalInputObject,
        resourceInput: patientInputObject
    }
    
}