FROM node:7.1.0

RUN apt-get update \
 && apt-get install -y openssl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app
RUN npm run build

CMD ./start_prod.sh
