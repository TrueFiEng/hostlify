FROM node:16 as base

WORKDIR /usr/src/app
COPY package.json ./
COPY tsconfig.json ./
RUN yarn
COPY ./src ./src
RUN yarn build

EXPOSE 3000
CMD yarn start
