# ROAD TRANSPORT RESERVATION API

### Introduction

This project is a mini for a road transportation reservation system, where customers often plan their travel depending on their destination.

### Project Support Features

- User can Signup and Login to their accounts
- Public (non-authenticated) users can access availiable trips on the platform
- Authenticated users can book trip and delete already booked trip
- Users can rate drivers after completion of a successful trip
- Users can get total amount of trips taken and can access total amount of trips a driver already made
- Drivers can create, update, delete trip

## Installation Guide

## RUNNING ON LOCALLY ON MACHINE

### Pre-requisite

- [Node js](https://nodejs.org/en/download/)
- [Mongo DB](https://www.mongodb.com/try/download/shell)
- [Cloudinary]()

### Steps

- Clone this repository [here](https://github.com/Lekejosh/Road-Transportation-System.git).
- The master branch is the most stable at any given time, ensure you're working from it.
- Run "npm install" to install all dependencies
- Create an .env file in your project root folder and add your variables. See .env.sample for assistance.

### Usage

- Run 'npm start' to start the application.
- Connect to the API using Postman on port 8080.

## USING DOCKER

### Pre-requisite

- [Docker Destop(MAC)](https://desktop.docker.com/mac/main/arm64/Docker.dmg?utm_location=module) || [Docker Destop(Windows)](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_location=module) || [Docker Destop(Linux)](https://docs.docker.com/desktop/linux/install/)

### Steps

- After installing Docker desktop on your PC
- Change your DB_URI to 'mongodb://mongo_db:27017'
- Run `npm start:docker`

## API Endpoints

- Check [Postman Documentation](https://documenter.getpostman.com/view/17957003/2s93CGTGy8) for more info

### User

| HTTP Verbs | Endpoints                          | Action                                                                              |
| ---------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| POST       | /api/v1/user/register              | To sign up a new user account                                                       |
| POST       | /api/v1/user/login                 | To login an existing user account                                                   |
| POST       | /api/v1/user/email/verification    | To verify email address                                                             |
| GET        | /api/v1/user/email/verification    | To resend email OTP code                                                            |
| GET        | /api/v1/user/logout                | To logout user sesssion                                                             |
| PUT        | /api/v1/user/update                | To update user profile                                                              |
| POST       | /api/v1/user/update                | To update user password                                                             |
| PUT        | /api/v1/user/update/avatar         | To update user avatar                                                               |
| POST       | /api/v1/user/password/forgot       | For user that has forgot his password                                               |
| PUT        | /api/v1/user/password/reset/:token | Password reset links are sent to email Address of the user that forgot his password |

### Driver

| HTTP Verbs | Endpoints                        | Action                                                               |
| ---------- | -------------------------------- | -------------------------------------------------------------------- |
| POST       | /api/v1/driver/register          | For already Registered user who want to upgrade to becoming a driver |
| GET        | /api/v1/driver/all               | For users to get all available drivers                               |
| GET        | /api/v1/driver/:id                | To get a driver                                                      |
| POST       | /api/v1/driver/review            | To review a driver after a successful ride                           |
| GET        | /api/v1/driver/review            | To get driver review                                                 |
| DELETE     | /api/v1/driver/reviews/:reviewId | To delete review                                                     |

### Order

| HTTP Verbs | Endpoints                | Action                            |
| ---------- | ------------------------ | --------------------------------- |
| POST       | /api/v1/order/new        | For user to create new Trip Order |
| GET        | /api/v1/order/single/:id | For users to get single order     |
| GET        | /api/v1/order/all        | To get User all orders            |
| DELETE     | /api/v1/order/remove     | For User to delete unpaid order   |
| POST       | /api/v1/order/pay/:id    | To pay pending order              |

### Transport

| HTTP Verbs | Endpoints                           | Action                                   |
| ---------- | ----------------------------------- | ---------------------------------------- |
| POST       | /api/v1/transport/create            | For driver to create new Trip            |
| PUT        | /api/v1/transport/trip/update       | For driver to get Trip                   |
| GET        | /api/v1/transport/state             | To get User to get trips by states       |
| GET        | /api/v1/transport/trip/complete/:id | For Driver to update a trip as completed |
| GET        | /api/v1/transport/all               | To get all available trips               |
| DELETE     | /api/v1/transport/delete/:id        | To get delete a trip                     |

### Admin

| HTTP Verbs | Endpoints                    | Action                         |
| ---------- | ---------------------------- | ------------------------------ |
| POST       | /api/v1/admin/user-create    | For Admin to create a new user |
| GET        | /api/v1/admin/users          | To get all users               |
| GET        | /api/v1/admin/user/:id       | To get a single User           |
| DELETE     | /api/v1/admin/user/:id       | To delete a user               |
| PATCH      | /api/v1/admin/user/:id       | To update a user               |
| GET        | /api/v1/admin/drivers        | To get all drivers             |
| GET        | /api/v1/admin/driver/:id     | To get a single driver         |
| DELETE     | /api/v1/admin/driver/:id     | To delete a driver             |
| PATCH      | /api/v1/admin/driver/:id     | To update a driver             |
| POST       | /api/v1/admin/create         | To create Admin                |
| GET        | /api/v1/admin/all/admin      | To get all admins              |
| GET        | /api/v1/admin/admin/find/:id | To get a single admin          |
| DELETE     | /api/v1/admin/admin/find/:id | To delete a admin              |
| PATCH      | /api/v1/admin/admin/find/:id | To update an admin             |
| GET        | /api/v1/daily                | To get all daily summary       |
| GET        | /api/v1/daily                | To get all trip summary        |

## Technologies Used

- [NodeJS](https://nodejs.org/) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
- [ExpressJS](https://www.expresjs.org/) This is a NodeJS web application framework.
- [MongoDB](https://www.mongodb.com/) This is a free open source NOSQL document database with scalability and flexibility. Data are stored in flexible JSON-like documents.
- [Mongoose ODM](https://mongoosejs.com/) This makes it easy to write MongoDB validation by providing a straight-forward, schema-based solution to model to application data.

### Author

- [Adeleke Joshua](https://github.com/lekejosh)

### License

This project is available for use under the MIT License.
