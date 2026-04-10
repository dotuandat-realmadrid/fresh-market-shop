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
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Tạo thư mục lưu ảnh upload (sẽ được mount qua volume)
RUN mkdir -p /app/uploads

# Copy JAR từ stage build
COPY --from=builder /app/target/*.jar app.jar

# Expose port backend
EXPOSE 8088

# Chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
