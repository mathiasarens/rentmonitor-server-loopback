# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16.10-alpine

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build

EXPOSE 3000

CMD [ "sh","-c", "node ./dist/src/migrate.js && node ./dist/src/index.js" ]
