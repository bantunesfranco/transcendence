FROM node:20

# Set the working directory
WORKDIR /backend

# Install app dependencies by copying package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Your application binds to these ports
EXPOSE 3000
EXPOSE 8080
EXPOSE 6969

# Define the command to run your app
CMD ["npm", "run", "start:dev"]
