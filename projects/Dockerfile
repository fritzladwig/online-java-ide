FROM openjdk:17-jdk-alpine
LABEL authors="F2"
COPY target/project-0.0.1-SNAPSHOT.jar projects.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "projects.jar"]
