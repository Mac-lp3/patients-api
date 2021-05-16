import * as Hapi from 'hapi';
import * as patients from './handlers/patients';

const PORT = 8080;
const HOST = '0.0.0.0';

async function init() {

    const server = new Hapi.Server({
        port: PORT,
        host: HOST
    });

    server.route({
        method: 'GET',
        path: '/api/patients',
        handler: patients.getPatientCollection
    });

    server.route({
        method: 'POST',
        path: '/api/patients',
        handler: patients.postPatientCollection
    });

    server.route({
        method: 'GET',
        path: '/api/patients/{patientID}',
        handler: patients.getPatientInstance
    });

    server.route({
        method: 'PATCH',
        path: '/api/patients/{patientID}',
        handler: patients.patchPatientInstance
    });

    await server.start();
    console.log('...Server up');

}

console.log('Starting server...');
init();
