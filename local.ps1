Set-Location compiler
mvn clean compile
mvn package -DskipTests
Set-Location ..

Set-Location discovery
mvn clean compile
mvn package -DskipTests
Set-Location ..

Set-Location projects
mvn clean compile
mvn package -DskipTests
Set-Location ..

Set-Location gateway
mvn clean compile
mvn package -DskipTests
Set-Location ..

Set-Location authorization
mvn clean compile
mvn package -DskipTests
Set-Location ..

Set-Location ui/frontend
npm install
ng build --configuration development
Set-Location ..
mvn clean compile
mvn package -DskipTests
Set-Location ..

docker-compose -f docker-compose-local.yml down
docker-compose -f docker-compose-local.yml up --build -d
