FROM tloncorp/urbit:v1.10 as urbit_distro
FROM alpine:3.16
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl git make
COPY --from=urbit_distro /bin/urbit /bin/urbit
COPY entry.sh /root/entry.sh
ENTRYPOINT ["bash", "entry.sh"]
