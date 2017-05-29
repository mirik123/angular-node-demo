
FROM node
LABEL package.description="basic-ws-client"

RUN groupadd -r test && useradd -r -m -s /bin/bash -g test test
RUN npm install tsd typings gulp -g

COPY . /home/test/app
WORKDIR /home/test/app
RUN chown -hR test:test /home/test/app
USER test

RUN npm install && tsd install && typings install
RUN gulp build
