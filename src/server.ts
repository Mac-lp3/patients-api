/**
 * This script:
 *  - initializes & configures the sever
 *  - registers each handler function with the corresponding endpoint/method
 *  - turns the server on
 *  - exports the server object so it can be imported by unit tests
 * 
 * Originally, the API used HapiJS as its server framework. An unforseen issue came up and due to
 * time constraints, it had to be replaced with ExpressJS. 
 * 
 * The rest of the API is loosly coupled with the server framework, so the change took only minutes.
 * 
 * It could be further decoupled if needed.
 */
import * as express from 'express';
import { ApiResponse } from './types/response';
import * as patients from './endpoints/patients/handlers';

// TODO env vars for host/port
const port = 8080;
const app = express();
app.use(express.json());

/**
 * Register the routes and handlers.
 * 
 * For a larger API, this could be done by detecting and looping over handler functions for each resource 
 * (or by just exporting a config object from each resource folder).
 */

// GET collection
app.get('/api/patients', async (req, res) => {

    const rawPayload: ApiResponse = await patients.getPatientCollection(req as any)
    const returnCode = Number(rawPayload.metadata.httpCode);

    res.status(returnCode).send(rawPayload);
})

// POST collection
app.post('/api/patients', async (req, res) => {

    const rawPayload: ApiResponse = await patients.postPatientCollection(req as any);
    const returnCode = Number(rawPayload.metadata.httpCode);

    res.status(returnCode).send(rawPayload);
})

// GET instance
app.get('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.getPatientInstance(req as any)
    const returnCode = Number(rawPayload.metadata.httpCode);

    res.status(returnCode).send(rawPayload);
})

// PATCH instance
app.patch('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.patchPatientInstance(req as any)
    const returnCode = Number(rawPayload.metadata.httpCode);

    res.status(returnCode).send(rawPayload);
})

// PUT instance
app.put('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.putPatientInstance(req as any)
    const returnCode = Number(rawPayload.metadata.httpCode);

    res.status(returnCode).send(rawPayload);
})

// DELETE instance
app.delete('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.deletePatientInstance(req as any)
    const returnCode = Number(rawPayload.metadata.httpCode);

    res.status(returnCode).send(rawPayload);
})

/**
 * Turn it on
 */
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})

/**
 * export for tests
 */
export { app as server };
