# # Use Node.js as the base image for the build stage (Version 20 or up)
FROM node:22 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
RUN npm run build

# Runtime stage
FROM node:22-slim AS runner

# Set the working directory inside the container
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

ARG VERSION
ENV APP_VERSION=$VERSION

# Expose the port the application will listen on (default is 3000)
EXPOSE 8080

# Define the command to run the application when the container starts
CMD ["npm", "start"]