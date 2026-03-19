FROM node:20-alpine

# Install Sysdig for eBPF kernel level monitoring
RUN apk add --no-cache curl bash python3 \
    && curl -s https://s3.amazonaws.com/download.draios.com/stable/install-sysdig | bash

WORKDIR /home/node/app

# The worker script that listens to Redis
COPY worker.js .
COPY sysdig-rules.yaml /etc/sysdig/sysdig-rules.yaml

USER root
# Start sysdig in the background dumping alerts, and run the worker
CMD sysdig -c echo_out "fd.type=ipv4 and evt.type=connect" > /var/log/sysdig_net.log & node worker.js
