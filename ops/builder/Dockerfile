FROM node:12.13.0-alpine3.10
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl g++ gcc git jq make python
RUN npm config set unsafe-perm true
RUN npm install -g npm@6.14.7
RUN npm install -g lerna@3.22.1
COPY entry.sh /entry.sh
ENV PATH="./node_modules/.bin:${PATH}"
ENTRYPOINT ["bash", "/entry.sh"]
