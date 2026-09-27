FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY scripts ./scripts
RUN npm ci
COPY index.html ./
COPY src ./src
COPY tests ./tests
RUN npm test && npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
