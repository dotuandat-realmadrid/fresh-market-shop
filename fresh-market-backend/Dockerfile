# ==============================
# Stage 1: Build
# ==============================
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml trước để cache layer dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code và build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================
# Stage 2: Runtime
# ==============================
# Stage 2: Run with JRE
FROM eclipse-temurin:21-jre-alpine

# Cấu hình múi giờ Việt Nam (UTC+7)
RUN apk add --no-cache tzdata
ENV TZ=Asia/Ho_Chi_Minh

WORKDIR /app

# Tạo thư mục lưu ảnh upload
RUN mkdir -p /app/uploads

# Copy toàn bộ ảnh có sẵn từ thư mục uploads trong Git vào container
COPY uploads ./uploads

# Copy JAR từ stage build
COPY --from=builder /app/target/*.jar app.jar

# Expose port backend
EXPOSE 8088

# Chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
