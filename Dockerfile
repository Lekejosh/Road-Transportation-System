FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci
COPY . .
ENV PORT = 8080
ENV DB_URI = mongodb://mongo_db:27017
ENV DB_NAME = reservation
EXPOSE 8080
CMD ["npm","run","dev"]