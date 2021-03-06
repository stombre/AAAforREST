var test = require('frisby');

test.create('HTTP basic authentication')
  .get('http://cassandre.local:1337/text/Wonderland/')
  .auth('alice', 'whiterabbit')
  .expectStatus(200)
  .toss();
test.create('Site cookie authentication')
  .post('http://cassandre.local:1337/_session', {name:'alice', password:'whiterabbit'})
  .expectStatus(200)
  .after(function(error, resource) {
    test.create('HTTP cookie authentication use')
      .get('http://cassandre.local:1337/text/Wonderland/')
      .addHeader('Cookie', resource.headers['set-cookie'])
      .expectStatus(200)
      .toss();
  })
  .toss();

test.create('Domain cookie connection with valid credentials')
  .post('http://auth.local:1337/_session', {name:'alice', password:'whiterabbit'})
  .addHeader('Content-Type', 'application/x-www-form-urlencoded')
  .expectStatus(200)
  .after(function(error, resource) {
    var cookie = resource.headers['set-cookie'];
    test.create('Domain cookie information')
      .get('http://auth.local:1337/_session')
      .addHeader('Cookie', cookie)
      .expectStatus(200)
      .expectJSON({
        ok: true,
        name: 'alice'
      })
      .after(function(error, resource) {
        test.create('Domain cookie disconnection')
          .delete('http://auth.local:1337/_session')
          .addHeader('Cookie', cookie)
          .expectStatus(200)
          .toss();
        })
        .after(function(error, resource) {
          test.create('Domain cookie information')
            .get('http://auth.local:1337/_session')
            .addHeader('Cookie', cookie)
            .expectJSONTypes({
              ok: true,
              name: function(val) {return val===undefined;}
            })
            .toss();
        })
      .toss();
  })
  .toss() ;
test.create('Domain cookie creation with invalid credentials')
  .post('http://auth.local:1337/_session', {name:'alice', password:'rabbit'})
  .addHeader('Content-Type', 'application/x-www-form-urlencoded')
  .expectStatus(401)
  .toss();
