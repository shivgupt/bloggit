FROM tloncorp/urbit:v1.10 as urbit_distro
WORKDIR /root
ENV HOME /root
COPY entry.sh /root/entry.sh
ENTRYPOINT ["bash", "entry.sh"]
