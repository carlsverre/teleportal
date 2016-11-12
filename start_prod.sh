#!/bin/bash

set -e

mkdir -p /ssl

if [[ ! -e /ssl/host.key ]]; then
    if [[ -z "$DOMAIN" ]]; then
        echo "Must set the DOMAIN env variable for the self-signed certificate."
        exit 1
    fi

    openssl genrsa 4096 > /ssl/host.key
    openssl req \
        -new \
        -newkey rsa:4096 \
        -days 365 \
        -nodes \
        -x509 \
        -subj "/O=teleportal/CN=$DOMAIN" \
        -keyout /ssl/host.key \
        -out /ssl/host.cert

    cat /ssl/host.cert /ssl/host.key > /ssl/host.pem
fi

NODE_ENV=production npm start
