# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app's source code inside the Docker image
COPY . .

# Make port 10000 available to the world outside this container
EXPOSE 10000

# Define the command to run the app
CMD [ "node", "src/backend/blind_match/src/backend/server.js" ]
