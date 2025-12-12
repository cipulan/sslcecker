FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Note: strict-ssl is temporarily disabled during build to handle environments with
# certificate issues. In production, ensure your npm registry has proper SSL certificates.
# For security-critical deployments, consider using a private npm registry with valid certs.
RUN npm config set strict-ssl false && npm install && npm config set strict-ssl true

# Copy application files
COPY server.js ./

# Expose the port
EXPOSE 3000

# Set environment variable
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
