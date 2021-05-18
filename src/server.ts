import * as express from 'express';
import { ApiResponse } from './types/response';
import * as patients from './endpoints/patients/handlers';

const port = 8080;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello')
})

app.get('/api/patients', async (req, res) => {

    const rawPayload: ApiResponse = await patients.getPatientCollection(req as any)
    const retCode = Number(rawPayload.metadata.httpCode);

    res.status(retCode).send(rawPayload);
})

app.post('/api/patients', async (req, res) => {

    const rawPayload: ApiResponse = await patients.postPatientCollection(req as any);
    const retCode = Number(rawPayload.metadata.httpCode);

    res.status(retCode).send(rawPayload);
})

app.get('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.getPatientInstance(req as any)
    const retCode = Number(rawPayload.metadata.httpCode);

    res.status(retCode).send(rawPayload);
})

app.patch('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.patchPatientInstance(req as any)
    const retCode = Number(rawPayload.metadata.httpCode);

    res.status(retCode).send(rawPayload);
})

app.put('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.putPatientInstance(req as any)
    const retCode = Number(rawPayload.metadata.httpCode);

    res.status(retCode).send(rawPayload);
})

app.delete('/api/patients/:patientID', async (req, res) => {

    const rawPayload: ApiResponse = await patients.deletePatientInstance(req as any)
    const retCode = Number(rawPayload.metadata.httpCode);

    res.status(retCode).send(rawPayload);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

export { app as server };
