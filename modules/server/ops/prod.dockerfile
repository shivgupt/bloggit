FROM node:12.13.0-alpine3.10
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl g++ gcc git jq make python
RUN npm config set unsafe-perm true
RUN npm install -g npm@6.12.0

COPY modules/server/package.json package.json
RUN npm install > /dev/null 2>&1

ARG CONTENT_REPO
RUN git clone $CONTENT_REPO /blog-content

COPY ops/wait-for.sh ops/wait-for.sh
COPY modules/server/ops ops
COPY modules/server/dist dist

ENTRYPOINT ["bash", "ops/entry.sh"]

