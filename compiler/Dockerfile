FROM openjdk:17-jdk-alpine
LABEL authors="F2"
COPY target/compiler-0.0.1-SNAPSHOT.jar compiler.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "compiler.jar"]
