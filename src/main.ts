import * as Hapi from 'hapi';

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
        handler: (request, h) => {

            return 'Hello World!';
        }
    });

    await server.start();
    console.log('...Server up');

}

console.log('Starting server...');
init();
