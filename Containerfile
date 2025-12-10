FROM node:23.5.0-alpine AS build

ARG S3ACCESSKEY=
ARG S3SECRETKEY=
ARG S3ENDPOINT=
ARG GITHASH=
ARG JSONDEBUG=false
ARG DEPLOY_ENV=green
ARG CACHEFOLDER=

WORKDIR /app

COPY --chown=1001:1001 . .
ENV NODE_OPTIONS=--max_old_space_size=16384
RUN npm install
ENV NODE_ENV=production
ENV GITHASH=${GITHASH}
ENV S3ACCESSKEY=${S3ACCESSKEY}
ENV S3SECRETKEY=${S3SECRETKEY}
ENV S3ENDPOINT=${S3ENDPOINT}
ENV JSONDEBUG=${JSONDEBUG}
ENV CACHEFOLDER=${CACHEFOLDER}
RUN npm run build

FROM node:23.5.0-alpine AS production
USER node
WORKDIR /app

COPY --chown=1001:1001 --from=build .next .next
COPY --chown=1001:1001 --from=build public public
COPY --chown=1001:1001 --from=build *.json *.json
COPY --chown=1001:1001 --from=build *.ts *.ts
COPY --chown=1001:1001 --from=build *.mjs *.mjs
COPY --chown=1001:1001 --from=build node_modules node_modules

ENV DEPLOY_VERSION=${DEPLOY_ENV}
ENV GITHASH=${GITHASH}
ENV S3ACCESSKEY=${S3ACCESSKEY}
ENV S3SECRETKEY=${S3SECRETKEY}
ENV S3ENDPOINT=${S3ENDPOINT}
ENV JSONDEBUG=${JSONDEBUG}
ENV NODE_ENV=production

EXPOSE 3000

CMD [ "npm", "run", "start-container" ]