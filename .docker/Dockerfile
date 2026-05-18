# Use Node.js 18 as the base image (compatible with package.json requirements)
FROM node:18

# Set working directory
WORKDIR /app

# Install Quasar CLI globally using npm
RUN npm install -g @quasar/cli

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose port for Quasar dev server
EXPOSE 9811

# Default command to keep the container running
CMD ["bash"]