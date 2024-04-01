FROM node:20

# Set the working directory
WORKDIR /frontend

# Install app dependencies by copying package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Your application binds to this port
EXPOSE 4200

# Define the command to run your app
CMD ["npm", "run", "start"]
