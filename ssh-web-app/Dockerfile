# Stage 1: Build the frontend
FROM node:18 AS frontend-build

# Set the working directory for the frontend
WORKDIR /app

# Copy the root package.json and package-lock.json (shared dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the .env file into the container
COPY .env .env


# Copy only the frontend source code and public assets
COPY ./src ./src
COPY ./public ./public
COPY ./server ./server

# Build the React frontend
RUN NODE_OPTIONS='--openssl-legacy-provider' npm run build

# Expose both the React app port and the backend port
EXPOSE 3000
EXPOSE 5001

# Start both the backend server and React app concurrently
CMD ["npm", "start"]
