# Use the official Node.js image as the base
FROM node:18-alpine 

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the Node.js application will run
EXPOSE 8080

RUN chmod +x run
RUN ./run install

# Command to start the Node.js application
CMD ["./run", "start"]