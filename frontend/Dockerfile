# Build Stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Environment variable must be injected during build time for Create React App
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine

# Copy built assets to Nginx static HTML folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose Web port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
