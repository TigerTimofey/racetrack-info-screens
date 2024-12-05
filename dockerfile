# Build stage
FROM node:18-alpine as build

# Установка зависимостей для сборки
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Копирование и сборка приложения
COPY . .
ENV REACT_APP_SERVER_URL=https://racetrack-backend-production.up.railway.app
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Запуск nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]