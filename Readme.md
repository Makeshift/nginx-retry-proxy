# Nginx Retry Proxy

Inspired by [this Stackexchange question](https://superuser.com/questions/746028/configuring-nginx-to-retry-a-single-upstream-server), this is a very simple little webserver that acts as a backup for when Nginx is down, and auto-refreshes the page for you.

It refreshes the page by using Javascript. If the client you're using doesn't support Javascript, it's expected to retry the connection itself. The proxy will return a 504 by default (See Options to change this behaviour).

## Getting Started

### Docker

The recommended way to run this proxy is via Docker, like so:

```bash
docker run -it makeshift27015/nginx-retry-proxy -p 8080:8080
```

See the `docker-compose.yml` file for an example.

### Not Docker

```bash
git clone https://github.com/Makeshift/nginx-retry-proxy.git
cd nginx-retry-proxy
npm install
npm start
```

See Options below for information on env vars and args.

### Nginx

To use this proxy with Nginx, simply add it as a backup to your upstream, where `nginx_upstream` refers to the service you're trying to proxy to, and `backup_proxy:8080` is where this proxy is running.

```
upstream upstream {
  server nginx_upstream;

  server backup_proxy:8080 backup;
}

server {
  listen        80 default_server;

  location / {
    proxy_pass    http://upstream;
  }
}
```

See `default.conf` for the same as above. It gets dropped straight into `/etc/nginx/conf.d/default.conf`.

## Options

### Ports

You can optionally start on a port that isn't 8080 with `npm start 80` or any other port. You can also use the environment variable `PORT`.

### Healthchecks

By default, the only request endpoint that doesn't result in a HTML document with some Javascript for a refresh is `/retry-proxy/healthcheck`, which returns a 200 OK.

This endpoint can be modified by providing the `HEALTHCHECK_PATH` env var. Eg `HEALTHCHECK_PATH=/different/healthcheck/endpoint`

You can also tell the proxy how many times since startup it should log out requests to the healthcheck path. For example, if `HEALTHCHECK_REPLIES=10` it will log out the first 10 requests send to `HEALTHCHECK_PATH`, then stop logging them.

If set to 0, it will always log out requests.

### Return Code

By default, the proxy returns a `504 Gateway Timeout`, which is what Nginx also sends by default. This behaviour can be changed with the `RESPONSE_HTTP_CODE` env var.

### Headers

By default, no additional headers are set (aside from those provided by default by [Fastify](https://www.fastify.io/)). This behaviour can also be changed, and additional headers can be added.

A use-case for this is, for example, setting `RESPONSE_HTTP_CODE` to `301`, then you could set a header containing `Location: https://example.com/` to redirect the request.

Headers can be set with the `RESPONSE_HTTP_HEADERS` env var, and are comma separated. For example:
```
RESPONSE_HTTP_HEADERS="Location: http://backup.example.com, Cache-Control: no-cache"
```

See the `docker-compose.yml` file for examples. If extraneous quotes or spaces are added, it will try to parse them.

### Response Content/Content-Type

By default, the response Content-Type is `text/html`. This can be changed with the `RESPONSE_TYPE` env var.

The default response text is: `The server you requested is down. Retrying...<script>setTimeout(() => window.location.reload(), 5000);</script>`.

This can be changed with the `RESPONSE_STRING` env var.

## Tests

TODO :(
