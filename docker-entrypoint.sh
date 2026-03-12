#!/bin/sh
envsubst < /tmp/index.html > /usr/share/nginx/html/index.html
exec "$@"
