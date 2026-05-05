# ============================================================
# FILE: backend/Dockerfile
# ============================================================
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S edlearn && adduser -S edlearn -G edlearn
COPY --from=builder /app/target/edlearn-*.jar app.jar
RUN mkdir -p /uploads/edlearn && chown -R edlearn:edlearn /uploads
USER edlearn
EXPOSE 8080
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
