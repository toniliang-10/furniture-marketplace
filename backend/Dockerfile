# --- Stage 1: build the jar ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Cache dependencies first (only re-downloads when pom.xml changes)
COPY mvnw mvnw
COPY .mvn .mvn
COPY pom.xml pom.xml
RUN ./mvnw -q dependency:go-offline

# Build the application
COPY src src
RUN ./mvnw -q clean package -DskipTests

# --- Stage 2: slim runtime image ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render/Railway inject the port via $PORT; Spring reads server.port from it.
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
