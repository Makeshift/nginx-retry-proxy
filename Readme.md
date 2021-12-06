# Nginx Retry Proxy

Inspired by [this Stackexchange question](https://superuser.com/questions/746028/configuring-nginx-to-retry-a-single-upstream-server), this is a very simple little webserver that acts as a backup for when Nginx is down, and auto-refreshes the page for you.

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

You can optionally start on a port that isn't 8080 with `npm start 80` or any other port.

### Nginx

To use this proxy with Nginx, simply add it as a backup to your upstream, where `nginx_upstream` refers to the service you're trying to proxy to, and `backup_proxy:8080` is where this proxy is running.

```
upstream upstream {
  server nginx_upstream resolve;

  server backup_proxy:8080 resolve backup;
}

server {
  listen        80 default_server;

  location / {
    proxy_pass    http://upstream;
  }
}
```

See `default.conf` for the same as above. It gets dropped straight into `/etc/nginx/conf.d/default.conf`.

### Raspberry Pi

The Node alpine image for the Rpi4 is broken, so there's also a docker tag for a fat version of the container that works on the Rpi4, `makeshift27015/nginx-retry-proxy:phat`
