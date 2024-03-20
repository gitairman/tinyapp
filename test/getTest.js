const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Login and Access Control Test', () => {
  it('GET /urls/b6UTxQ should return 403 status code if the logged in user is not the owner', () => {
    const agent = chai.request.agent('http://localhost:8080');

    return agent
      .post('/login')
      .send({ email: 'user2@example.com', password: 'dishwasher-funk' })
      .then(() => {
        return agent.get('/urls/b6UTxQ').then((accessRes) => {
          expect(accessRes).to.have.status(403);
        });
      });
  });
  it('GET / should redirect to /login if user is not logged in', () => {
    const agent = chai.request.agent('http://localhost:8080');

    return agent.get('/').then((accessRes) => {
      expect(accessRes).to.redirectTo(`${agent.app}/login`);
    });
  });
  it('GET /urls/new should redirect to /login if user is not logged in', () => {
    const agent = chai.request.agent('http://localhost:8080');

    return agent.get('/urls/new').then((accessRes) => {
      expect(accessRes).to.redirectTo(`${agent.app}/login`);
    });
  });
  it('GET /urls/ashjkl should show error message if user is not logged in', () => {
    const agent = chai.request.agent('http://localhost:8080');

    return agent.get('/urls/ashjkl').then((accessRes) => {
      expect(accessRes).to.have.header('error');
    });
  });
  it('GET /urls/ashjkl should show error message if it does not exist', () => {
    const agent = chai.request.agent('http://localhost:8080');

    return agent.get('/urls/ashjkl').then((accessRes) => {
      expect(accessRes).to.have.header('error');
    });
  });
});
