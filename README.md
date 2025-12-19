# brain100

requirements:
* node 22.5.1 (we recommend to use "nvm" or "n" package for installation)

* pnpm 8.15.2 (https://pnpm.io)
* docker 28.1.1
* docker-compose 2.33.1
* ruff 0.13.2

## 🚀 Quick Start

1. Install dependencies:
```bash
pnpm install && pnpm install:all
```

2. Set up environment variables:
```bash
./useEnvs.sh local
```

3. Start databases and nginx in containers:
```bash
docker-compose -f local.docker-compose.yml up --build
```

4. Run database migrations and generate client:
```bash
pnpm run br-general-python:prisma:migrate && pnpm run br-general-python:prisma:generate
```

5. Start the application:
```bash
pnpm start
```

### Main modules:
- Frontend: localhost:5173 (5174 internal - don't use it for development)
- Backend API: localhost:5173/br-general  (8000 internal - don't use it for development)
- Grafana: localhost:5173/grafana/login  


## Quick start in docker
1. Set up environment variables:
```bash
./useEnvs.sh docker
```

2. Start the application:
```bash
docker-compose -f local.docker.docker-compose.yml up --build
```

