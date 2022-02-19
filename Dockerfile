FROM node:16.13.0-alpine3.12
ENV NODE_ENV=production

COPY src src
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json

RUN yarn
RUN yarn build

RUN apk update
RUN apk add nginx

COPY config/ /etc/nginx/
COPY repository/ /usr/share/nginx/html

EXPOSE 80

COPY scripts/run.sh run.sh
CMD sh run.sh
