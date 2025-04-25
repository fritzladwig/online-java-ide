FROM openjdk:17-jdk-alpine
LABEL authors="F2"
COPY target/ui-0.0.1-SNAPSHOT.jar ui.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "ui.jar"]
