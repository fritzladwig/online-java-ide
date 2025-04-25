FROM openjdk:17-jdk-alpine
LABEL authors="F2"
COPY target/gateway-0.0.1-SNAPSHOT.jar gateway.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "gateway.jar"]
