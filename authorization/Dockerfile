FROM openjdk:17-jdk-alpine
LABEL authors="F2"
COPY target/authorization-0.0.1-SNAPSHOT.jar authorization.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "authorization.jar"]
