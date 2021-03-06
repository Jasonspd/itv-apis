const Hapi = require('hapi');
const http = require('http');
const hal = require('hal');

const server = new Hapi.Server();
const port = 4000;

server.connection({port});

server.register(require('inert'), (err) => {
  if (err) throw err
  server.route([
    {
      method: 'get',
      path: '/',
      handler: (request, reply) => {
        reply.file('./index.html')
      }
    },
    {
      method: 'get',
      path: '/{filename}.js',
      handler: (request, reply) => {
        reply.file('./index.js')
      }
    },
    {
      //Make API's request to Channels
      method: 'get',
      path: '/channel',
      handler: (request, reply) => {
        var resource = new hal.Resource({name: 'Channels'}, 'fetd.prod.cps.awseuwest1.itvcloud.zone/platform/itvonline/samsung/channels?broadcaster=ITV')
        var replying = ''
        const options = {
          method: 'get',
          hostname: 'fetd.prod.cps.awseuwest1.itvcloud.zone',
          path: '/platform/itvonline/samsung/channels?broadcaster=ITV',
          // This is what makes a machine readable JSON response.
          // To have a clue to see how to do it I run this script in my cmd line to see the data:
          // curl -H "accept: application/vnd.itv.default.channel.v1+hal+json; charset=UTF-8" http://fetd.prod.cps.awseuwest1.itvcloud.zone/platform/itvonline/samsung/channels?broadcaster=ITV
          headers: {
            'accept': 'application/vnd.itv.default.channel.v1+hal+json; charset=UTF-8'
          }
        }
        const req = http.request(options, (res) => {
          res.setEncoding('utf8')
          res.on('data', (chunk) => {
            replying += chunk
          })
          res.on('end', () => {
            reply(replying)
          })
        })
        req.end();
      }
    },
    {
      //Make API's request to all Programmes
      method: 'get',
      path: '/{programmes*}',
      handler: (request, reply) => {
        var resource = new hal.Resource({name: request.params.programmes}, 'fetd.prod.cps.awseuwest1.itvcloud.zone/platform/itvonline/samsung/productions?grouping=latestPerProgramme&channelId=' + request.params.programmes)
        var replying = ''
        const options = {
          method: 'get',
          hostname: 'fetd.prod.cps.awseuwest1.itvcloud.zone',
          path: '/platform/itvonline/samsung/productions?grouping=latestPerProgramme&channelId=' + request.params.programmes,
          headers: {
            'accept': 'application/vnd.itv.default.production.v2+hal+json; charset=UTF-8'
          }
        }
        const req = http.request(options, (res) => {
          res.setEncoding('utf8')
          res.on('data', (chunk) => {
            replying += chunk
          })
          res.on('end', () => {
            console.log(replying)
            reply(replying)
          })
        })
        req.end();
      }
    }
  ])
})

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('server running on ', server.info.uri);
})

module.exports = server;
