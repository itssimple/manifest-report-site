FROM node:18.20.8-alpine AS build

WORKDIR /

COPY --chown=1001:1001 *.json ./
COPY --chown=1001:1001 *.config.ts ./
COPY --chown=1001:1001 *.config.mjs ./
COPY --chown=1001:1001 src src
RUN npm install
RUN npm run build

FROM node:18.20.8-alpine AS runtime
ARG DEPLOY_ENV=green
ARG PORT=3001
ARG S3ENDPOINT=
ARG S3ACCESSKEY=
ARG S3SECRETKEY=
ARG JSONDEBUG=false
ARG TIMINGLOG=false
ENV DEPLOY_VERSION=${DEPLOY_ENV}
WORKDIR /

USER node

COPY --chown=1001:1001 --from=build package*.json ./
COPY --chown=1001:1001 --from=build .next .next
COPY --chown=1001:1001 --from=build public public

EXPOSE ${PORT}

CMD [ "npm", "run", "start-${DEPLOY_VERSION}" ]