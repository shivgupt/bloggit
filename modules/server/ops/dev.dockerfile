FROM node:12.13.0-alpine3.10
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl g++ gcc git jq make python
RUN npm config set unsafe-perm true
RUN npm install -g npm@6.12.0

COPY modules/server/ops ops
COPY ops/wait-for.sh ops/wait-for.sh
COPY modules/server/dist dist

ENTRYPOINT ["bash", "ops/entry.sh"]
