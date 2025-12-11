FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (disable strict SSL for environments with certificate issues)
RUN npm config set strict-ssl false && npm install && npm config set strict-ssl true

# Copy application files
COPY server.js ./

# Expose the port
EXPOSE 3000

# Set environment variable
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
