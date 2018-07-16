/* globals describe, it  */

import chai, { expect, should } from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import token from '../helpers/generateToken';

chai.use(chaiHttp);
should();

describe('TEST API USER`S ENDPOINTS TESTS', () => {
  describe('POST A RIDE OFFER ENDPOINT TESTS', () => {
    it('should return successfully when posted data has values for all the required fields', (done) => {
      chai.request(app)
        .post('/api/v1/users/rides')
        .send({
          destination: 'Orisunbare',
          time: '5:00 PM',
          date: '12/6/2018',
          takeOffVenue: 'Egbeda',
        })
        .set('x-access-token', token)
        .end((error, response) => {
          expect(response).to.have.status(200);
          done();
        });
    });


    it('should return unsuccessfully, when a post request is made with missing required fields', (done) => {
      chai.request(app)
        .post('/api/v1/users/rides')
        .set('x-access-token', token)
        .send({})
        .end((error, response) => {
          response.body.errors.should.be.an('object');
          response.body.errors.should.have.property('destination');
          response.body.errors.destination.should.equal('destination is required');
          response.body.should.have.property('status');
          response.body.status.should.equal(false);
          response.body.should.have.property('message');
          response.body.message.should.have.equal('You submitted Invalid Data!');
          response.status.should.equal(400);
          done();
        });
    });

    it('should return with a status code of 400 : Bad Request when a post request is made with no data', (done) => {
      chai.request(app)
        .post('/api/v1/users/rides')
        .set('x-access-token', token)
        .send()
        .end((error, response) => {
          response.status.should.equal(400);
          done();
        });
    });


    it('should return with a status code of 400 : Bad Request when required post properties exist but having empty strings as value', (done) => {
      chai.request(app)
        .post('/api/v1/users/rides')
        .set('x-access-token', token)
        .send({
          destination: '',
          time: '',
          date: '',
        })
        .end((error, response) => {
          response.status.should.equal(400);
          done();
        });
    });

    it('should fail when a database rule is violated', (done) => {
      chai.request(app)
        .post('/api/v1/users/rides')
        .set('x-access-token', token)
        .send({
          destination: 'Ilupeju some veery looooooooooooooooooooog locaton far far far far far far far far from take off venue',
          time: '1',
          date: '13/14/2',
          takeOffVenue: 'somewhere',
        })
        .end((error, response) => {
          response.status.should.equal(500);
          done();
        });
    });
  });

  describe('GET ALL REQUESTS FOR A SPECIFIC RIDE', () => {
    it('should return successfully when ride ID is valid, found in the database AND  at least a request exist for the ride in question', (done) => {
      chai.request(app).get('/api/v1/users/rides/1/requests').set('x-access-token', token).end((error, response) => {
        expect(response).to.have.status(200);
        expect(response.type).to.equal('application/json');
        expect(response.body).to.have.ownProperty('requests');
        response.body.requests.should.be.an('array');
        expect(response.body.status).to.equal(true);
        done();
      });
    });

    it('should fail when the ride ID is not found in the database', (done) => {
      chai.request(app).get('/api/v1/users/rides/768/requests')
        .set('x-access-token', token)
        .end((error, response) => {
          response.should.have.status(404);
          response.body.status.should.equal(false);
          response.body.error.should.equal('No Request Found!');
          done();
        });
    });

    it('should fail when the ride ID is INVALID', (done) => {
      chai.request(app).get('/api/v1/users/rides/4jsa/requests')
        .set('x-access-token', token)
        .end((error, response) => {
          response.should.have.status(400);
          response.body.status.should.equal(false);
          done();
        });
    });
  });

  describe('ACCEPT OR REJECT A RIDE REQUEST', () => {
    it('should return successfully when ride ID and request ID are valid and found in the database and action is specified', (done) => {
      chai.request(app).put('/api/v1/users/rides/3/requests/1')
        .set('x-access-token', token)
        .query({ action: 'accept' })
        .end((error, response) => {
          expect(response).to.have.status(200);
          response.body.status.should.equal(true);
          response.body.request.status.should.equal('accepted');
          done();
        });
    });

    it('should fail when query parameter value is neither `accept` or `reject`', (done) => {
      chai.request(app).put('/api/v1/users/rides/1/requests/5')
        .set('x-access-token', token)
        .query({ action: 'notacceptorreject' })
        .end((error, response) => {
          expect(response).to.have.status(400);
          response.body.status.should.equal(false);
          response.body.error.should.equal('Invalid update action');
          done();
        });
    });

    it('should fail when query parameter is not specified', (done) => {
      chai.request(app).put('/api/v1/users/rides/1/requests/2')
        .set('x-access-token', token)
        .end((error, response) => {
          expect(response).to.have.status(400);
          response.body.status.should.equal(false);
          response.body.error.should.equal('Invalid update action');
          done();
        });
    });

    it('should fail when query parameter is not of type `string`', (done) => {
      chai.request(app).put('/api/v1/users/rides/1/requests/2')
        .set('x-access-token', token)
        .query({ action: {} })
        .end((error, response) => {
          expect(response).to.have.status(400);
          response.body.status.should.equal(false);
          response.body.error.should.equal('Invalid update action');
          done();
        });
    });

    it('should fail when RIDE or REQUEST ID is INVALID', (done) => {
      chai.request(app).put('/api/v1/users/rides/id2/requests/id4')
        .set('x-access-token', token)
        .query({ action: 'reject' })
        .end((error, response) => {
          expect(response).to.have.status(400);
          response.body.status.should.equal(false);
          response.body.error.should.equal('Invalid Ride or Request ID');
          done();
        });
    });

    it('should fail when REQUEST ID is not FOUND', (done) => {
      chai.request(app).put('/api/v1/users/rides/1/requests/100')
        .set('x-access-token', token)
        .query({ action: 'reject' })
        .end((error, response) => {
          expect(response).to.have.status(404);
          response.body.status.should.equal(false);
          response.body.error.should.equal('Request Not Found');
          done();
        });
    });
  });
});