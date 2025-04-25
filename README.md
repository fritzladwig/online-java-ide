# Online Java IDE

https://github.com/user-attachments/assets/365d417a-c743-4ffd-af82-1362db969913

6 Microservices:
- Authorization - Distributes and validates JWT tokens. OAUTH2 tokens by external providers are replaced with its own tokens.
- Compiler - Receives files, compiles and runs them.
- Discovery - Netflix Eureka Server for service discovery.
- Gateway - API gateway for microservice application.
- Projects - Saves user projects.
- UI - Serves static angular frontend.

For deployment:

In Docker-compose:
- GOOGLE_ID, GOOGLE_SECRET - Oauth config
- GOOGLE_REDIRECT_URI - Set to website URL
- GATEWAY_URL - Set to website URL

env/auth:
- Replace with new keys

ui/frontend/src/environments
- apiUrl - Set to website URL
