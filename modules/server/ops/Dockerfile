FROM node:14.18.1-alpine3.14
WORKDIR /root
ENV HOME /root
ENV PATH $PATH:./node_modules/.bin:/root/node_modules/.bin
RUN apk add --update --no-cache bash curl g++ gcc git jq make python3
# npm 7.x.x doesn't seem to respect the --production flag so should we stick with 6.x.x?
RUN npm config set unsafe-perm true && npm install -g npm@8.1.0
RUN npm install ipfs-client@0.7.1 --no-save --no-package-lock
RUN npm install pino-pretty@7.0.1 --no-save --no-package-lock
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for

COPY ops ops
COPY dist dist

ENTRYPOINT ["bash", "ops/entry.sh"]
