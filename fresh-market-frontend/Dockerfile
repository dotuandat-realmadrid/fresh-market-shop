# ==============================
# Stage 1: Build React app
# ==============================
FROM node:20-alpine AS builder

WORKDIR /app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files trước để cache dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source và build production bundle
COPY . .
RUN npm run build

# ==============================
# Stage 2: Serve với Nginx
# ==============================
FROM nginx:alpine

# Xóa config mặc định của nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy build output từ stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
