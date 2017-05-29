
FROM node:slim
LABEL package.description="node-http-json"

RUN groupadd -r test && useradd -r -m -s /bin/bash -g test test
RUN npm install tsd typings gulp -g

COPY . /home/test/app
WORKDIR /home/test/app
RUN chown -hR test:test /home/test/app
USER test

RUN npm install && tsd install && typings install
RUN gulp script-express
RUN mkdir -p ./wwwroot/client/assets/icons
RUN touch ./wwwroot/client/assets/icons/favicon.ico
 
EXPOSE 8080
CMD ["nohup", "node", "./wwwroot/app-express.js", "&"]
