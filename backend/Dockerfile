FROM node:18-alpine

WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]
