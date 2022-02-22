FROM node:16.13.0-alpine3.12

LABEL org.opencontainers.image.source https://github.com/ethworks/hostlify

ENV NODE_ENV=production

COPY src src
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json

RUN yarn
RUN yarn build

RUN apk update
RUN apk add nginx

EXPOSE 80

CMD yarn dev
