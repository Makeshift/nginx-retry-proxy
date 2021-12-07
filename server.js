const port = process.argv[2] ? Number(process.argv[2]) : process.env.PORT ? Number(process.env.PORT) : 8080;
const healthcheckPath = process.env.HEALTHCHECK_PATH || '/retry-proxy/healthcheck';
const healthcheckReplies = (process.env.HEALTHCHECK_REPLIES ? Number(process.env.HEALTHCHECK_REPLIES) : 5) * 2; // 2 because both the REQ and RES are counted as a single reply
const statusCode = process.env.HTTP_RESPONSE_CODE ? Number(process.env.HTTP_RESPONSE_CODE) : 504;
const headers = process.env.HTTP_HEADERS
  ? Object.fromEntries(process.env.HTTP_HEADERS
    .split(',')
    .map(header => header
      .trim()
      .split(/:(.+)/) // split on the first colon
      .filter(a => a) // remove empty strings
      .map(a =>
        a.trim()
          .replace(/(?:^"|')|(?:"|'$)/g, '') // remove quotes at the beginning or end
          .trim()
      )
    )
  )
  : {};

const stream = require('stream');
const pino = require('pino');

let healthcheckRequestCount = 0;

const fastify = require('fastify')({
  logger: {
    serializers: {
      res: (reply) => {
        return {
          statusCode: reply.statusCode,
          headers: reply.headers,
          url: reply.request.raw.url
        };
      },
      req: (req) => {
        return {
          method: req.method,
          url: req.url,
          version: req.headers && req.headers['accept-version'],
          hostname: req.hostname,
          remoteAddress: req.ip,
          remotePort: req.socket ? req.socket.remotePort : undefined
        };
      },
      err: pino.stdSerializers.err
    },
    stream: new stream.Writable({
      write: function (chunk, encoding, callback, isHealthcheck = false) {
        const line = chunk.toString().trim();
        if (healthcheckReplies === 0 || !(isHealthcheck = line.includes(healthcheckPath)) || (healthcheckRequestCount < healthcheckReplies && isHealthcheck && ++healthcheckRequestCount)) {
          console.log(line);
        }
        callback();
      }
    })
  }
});

fastify.all(healthcheckPath, async (request, reply) => {
  reply.type('text/plain').send('OK');
});

fastify.all('/*', async (request, reply) => {
  console.log(headers);
  reply.type('text/html').code(statusCode).headers(headers)
    .send('The server you requested is down. Retrying...<script>setTimeout(() => window.location.reload(), 5000);</script>');
});

const start = async () => {
  try {
    await fastify.listen(port, '0.0.0.0');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = start;
