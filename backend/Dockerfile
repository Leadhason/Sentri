# Stage 1: Build stage with OpenJDK 24
FROM eclipse-temurin:24-jdk AS build
WORKDIR /app

# Copy Gradle wrapper and configuration files first to optimize Docker layer caching
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Ensure correct line endings and executable permissions for gradlew
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Download dependencies (cached unless dependencies change)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build the executable fat jar (tests skipped for image build)
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Minimal Runtime stage with Java 24 JRE
FROM eclipse-temurin:24-jre
WORKDIR /app

# Security: Create and run under a dedicated non-privileged system user
RUN addgroup --system sentri && adduser --system --ingroup sentri sentri
USER sentri:sentri

# Copy the built Spring Boot application jar from the build stage
COPY --from=build /app/build/libs/sentri-0.0.1-SNAPSHOT.jar app.jar

# Expose standard Spring Boot HTTP/WebSocket port
EXPOSE 8080

# Configurable JVM options and container memory limits
ENV PORT=8080 \
    JAVA_OPTS="-Xmx380m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
