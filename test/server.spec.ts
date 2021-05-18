import * as request from 'supertest';
import { assert } from 'chai';
import { server } from '../src/server';

describe('the server', function() {

    it('should accept GETs', function(done) {
        request(server)
            .get('/api/patients')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(resp => {
                assert.exists(resp.body.payload);
                assert.exists(resp.body.metadata);
                assert.notExists(resp.body.error);
                assert.isAbove(resp.body.metadata.total, 0);
                assert.isAbove(resp.body.payload.length, 0);
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            })
    })

    it('should delete', function (done) {
        request(server)
            .post('/api/patients')
            .send({
                firstName: 'testy',
                lastName: 'mctester',
                dob: '2020-20-20'
            })
            .expect(201)
            .then(res => {
                done();
            })
    })

    it('should only update ID when PATCH includes an ID field', function (done) {

        request(server)
            .patch('/api/patients/3179c55')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .send({
                isActive: true
            })
            .then(resp => {
                assert.exists(resp.body.payload);
                assert.exists(resp.body.metadata);
                assert.notExists(resp.body.error);
                assert.equal(resp.body.payload.id, '3179c55');
                assert.notEqual(resp.body.payload.firstName, 'Homer');

                request(server)
                    .patch('/api/patients/3179c55')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .send({
                        firstName: 'Homer'
                    })
                    .then(resp => {
                        assert.exists(resp.body.payload);
                        assert.exists(resp.body.metadata);
                        assert.notExists(resp.body.error);
                        assert.notEqual(resp.body.payload.id, '3179c55');
                        assert.equal(resp.body.payload.firstName, 'Homer');
                        done()
                    });
            });

    })

    it('should accept only 1 POST', function(done) {
        request(server)
            .post('/api/patients')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201)
            .send({
                firstName: 'homer',
                lastName: 'simpson',
                dob: '1969-01-01'
            })
            .then(resp => {

                assert.exists(resp.body.payload);
                assert.exists(resp.body.metadata);
                assert.notExists(resp.body.error);

                request(server)
                    .post('/api/patients')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(409)
                    .send({
                        firstName: 'homer',
                        lastName: 'simpson',
                        dob: '1969-01-01'
                    })
                    .then(resp => {
                        assert.exists(resp.body.metadata);
                        assert.exists(resp.body.error);
                        assert.notExists(resp.body.payload);
                        done();
                    }).catch(err => {
                        console.log(err);
                        done();
                    })
            })
            .catch(err => {
                console.log(err);
                done();
            })
    })

})