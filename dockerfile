# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Увеличиваем память для Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Копируем только package.json сначала
COPY package*.json ./
RUN npm ci --silent --no-optional

# Копируем остальные файлы и собираем
COPY . .
ENV REACT_APP_SERVER_URL=https://racetrack-backend-production.up.railway.app
ENV CI=false
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]