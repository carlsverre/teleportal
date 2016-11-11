#!/bin/bash

set -e

mkdir -p /ssl

if [[ ! -e /ssl/host.key ]]; then
    openssl genrsa 4096 > /ssl/host.key
    openssl req \
        -new \
        -newkey rsa:4096 \
        -days 365 \
        -nodes \
        -x509 \
        -subj "/C=US/O=carlsverre/CN=teleportal.memcompute.com" \
        -keyout /ssl/host.key \
        -out /ssl/host.cert

    cat /ssl/host.cert /ssl/host.key > /ssl/host.pem
fi

NODE_ENV=production npm start
