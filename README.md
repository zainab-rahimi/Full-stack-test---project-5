## Yoga sessions management application - full stack

The main goal of the application is to have 80% of test coverage for both backend, frontend and e2e. 

For running the application, install the dependencies: 

#### Dependencies:
- Java 17
- Spring boot
- Maven
- Node.js
- Mysql
- npm
- Yarn
- Angular CLI

### Running the tests

Before running the test, set up the database following the commands: 
```
# Connect to your mysql server using root
mysql -u root -u
# Create the database called "yoga"
CREATE DATABASE yoga;
```
You can find the test database configuration in the directory `back/src/main/resources/application.properties`.By running the backend application the database will be created with the below initial defaul test data:

- admin user: `yoga@studio.com` with the password `test!1234`
- teacher: Margot DELAHAYE, Hélène THIERCELIN



#### Frontend test Angular with Jest
Navigate to the frontend directory and install the dependencies and proceed to run the frontend test and e2e tests.
there is dedicated separate README.md file in the front directory for the frontend testing.
After running the tests you can find the coverage report in the directory `Testez-une-application-full-stack/front/coverage/jest/lcov-report/index.html`  

```
# navigate to the front directory
cd front
# install the dependencies
npm install
# Run unit tests
npm run test
# Run test with coverage report and you can find the report in the directory `Testez-une-application-full-stack/front/coverage/jest/lcov-report/index.html` 
npm test -- --coverage
```

#### E2E testing with Cypress
After running the tests you can find the coverage report in `Testez-une-application-full-stack/front/coverage/lcov-report/src/index.html`.
When running the tests in interactive mode you can choose to test each e2e test file separately.

```
# Run e2e test in headless mode
npm run cypress:run
# Run e2e tests in interactive mode
npm run cypress:open
```
#### Backend testing Spring boot 
For running the backend tests, go to the `backend` directory and run the command: 
```
mvn clean test
```
The coverage report is generated in the directory `target/site/jacoco/index.html` 


### Running the Application
For running the application run the backend and frontend separately. 

1- First start with the backend server go to the backend directory and run the command `mvn spring-boot:run` the backend server will be available in the localhost `http://localhost:8080/api`.

2- When the backend server was built and running go to the front directory and run the command `ng serve` in the project directory. The frontend will be available in `http://localhost:4200` 

