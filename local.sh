cd compiler
mvn clean compile
mvn package -DskipTests
cd ..

cd discovery
mvn clean compile
mvn package -DskipTests
cd ..

cd projects
mvn clean compile
mvn package -DskipTests
cd ..

cd gateway
mvn clean compile
mvn package -DskipTests
cd ..

cd authorization
mvn clean compile
mvn package -DskipTests
cd ..

cd ui/frontend
npm install
ng build --configuration development
cd ..
mvn clean compile
mvn package -DskipTests
cd ..

docker-compose -f docker-compose-local.yml down
docker-compose -f docker-compose-local.yml up --build -d
