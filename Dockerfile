FROM node

COPY bin/src package.json package-lock.json patient-api/

WORKDIR /patient-api

RUN npm install --production

EXPOSE 8080
