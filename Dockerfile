FROM node:16.16.0-alpine
WORKDIR /app

COPY ./ ./
RUN rm -rf .git
RUN npm install --save-dev
RUN npm run build
RUN rm -rf node_modules
EXPOSE 3000
