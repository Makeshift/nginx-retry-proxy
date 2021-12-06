const fastify = require('fastify')({ logger: true });

const port = process.argv[2] || 8080;

fastify.get('/*', async (request, reply) => {
  reply.type('text/html').send('The server you requested is down. Retrying...<script>setTimeout(() => window.location.reload(), 5000);</script>');
});

const start = async () => {
  try {
    await fastify.listen(port, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
