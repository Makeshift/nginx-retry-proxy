// I didn't want to add curl to the image, so I wrote this script to check the health of the service.

require('http').request({
  host: 'localhost',
  port: process.env.PORT || 8080,
  timeout: 2000,
  path: process.env.HEALTHCHECK_PATH || '/retry-proxy/healthcheck'
}, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).on('error', function (err) {
  console.log(err);
  process.exit(1);
}).end();
