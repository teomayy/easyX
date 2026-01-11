# EasyX Deployment Guide

## Development Environment

### Prerequisites
- Node.js >= 20
- PNPM >= 9
- Docker & Docker Compose
- Git

### Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd easyX

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
cp .env apps/api/.env
cp .env packages/database/.env

# 4. Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# 5. Setup database
pnpm db:generate
pnpm db:push

# 6. Start development server
PORT=3005 pnpm --filter @easyx/api dev
```

### Ports Configuration

| Service | Default Port | Dev Port |
|---------|-------------|----------|
| API | 3000 | 3005 |
| PostgreSQL | 5432 | 5433 |
| Redis | 6379 | 6380 |
| Prisma Studio | 5555 | 5555 |
| pgAdmin | 5050 | 5050 |

### Docker Services

```bash
# Start all services
docker compose -f docker/docker-compose.yml up -d

# Start with tools (pgAdmin, Redis Commander)
docker compose -f docker/docker-compose.yml --profile tools up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f

# Stop all services
docker compose -f docker/docker-compose.yml down

# Stop and remove volumes (reset data)
docker compose -f docker/docker-compose.yml down -v
```

## Production Deployment

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000

# Database (use strong password!)
DATABASE_URL=postgresql://easyx:STRONG_PASSWORD@postgres:5432/easyx

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT (generate secure secrets!)
JWT_SECRET=<generate-256-bit-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (your domain)
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Telegram
TELEGRAM_BOT_TOKEN=<your-bot-token>

# Blockchain nodes (mainnet)
BTC_RPC_URL=http://bitcoin-node:8332
BTC_RPC_USER=bitcoin
BTC_RPC_PASSWORD=<rpc-password>
BTC_NETWORK=mainnet

LTC_RPC_URL=http://litecoin-node:9332
LTC_RPC_USER=litecoin
LTC_RPC_PASSWORD=<rpc-password>

TRON_FULL_NODE_URL=https://api.trongrid.io
TRON_PRIVATE_KEY=<hot-wallet-private-key>

ETH_RPC_URL=https://mainnet.infura.io/v3/<project-id>
ETH_PRIVATE_KEY=<hot-wallet-private-key>
ETH_CHAIN_ID=1

# Exchange
EXCHANGE_MARGIN_PERCENT=1.5
BINANCE_API_KEY=<your-api-key>

# Limits
DAILY_WITHDRAW_NO_KYC=1000
DAILY_WITHDRAW_KYC=50000
MONTHLY_WITHDRAW_NO_KYC=5000
MONTHLY_WITHDRAW_KYC=500000
```

### Build

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter @easyx/api build
```

### Docker Production

```bash
# Build and start
docker compose -f docker/docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker/docker-compose.prod.yml logs -f api

# Scale API (if using load balancer)
docker compose -f docker/docker-compose.prod.yml up -d --scale api=3
```

### Nginx Configuration

```nginx
upstream easyx_api {
    server api:3000;
}

upstream easyx_web {
    server web:3000;
}

upstream easyx_admin {
    server admin:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://easyx_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://easyx_web;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://easyx_admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Migrations (Production)

```bash
# Run migrations
pnpm --filter @easyx/database migrate:deploy

# Check migration status
npx prisma migrate status
```

### Health Checks

```bash
# API health
curl https://api.yourdomain.com/api/v1/health

# Expected response
{"status":"ok","timestamp":"...","service":"easyx-api"}
```

## Security Checklist

### Before Production

- [ ] Change all default passwords
- [ ] Generate secure JWT_SECRET (256 bits)
- [ ] Configure CORS for your domains only
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Setup firewall rules
- [ ] Configure rate limiting
- [ ] Enable database backups
- [ ] Setup monitoring and alerting
- [ ] Review and secure blockchain private keys
- [ ] Configure log aggregation
- [ ] Test withdrawal limits

### Secrets Management

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Store secrets securely
# Option 1: Docker secrets
# Option 2: Kubernetes secrets
# Option 3: HashiCorp Vault
# Option 4: AWS Secrets Manager
```

### Backup Strategy

```bash
# PostgreSQL backup
pg_dump -h localhost -U easyx -d easyx > backup_$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump -h localhost -U easyx -d easyx | gzip > /backups/easyx_$(date +\%Y\%m\%d).sql.gz
```

## Monitoring

### Recommended Tools

- **Metrics**: Prometheus + Grafana
- **Logs**: Loki + Promtail
- **Tracing**: Jaeger (optional)
- **Alerts**: Alertmanager

### Key Metrics to Monitor

- API response times
- Error rates (4xx, 5xx)
- Database query performance
- Redis hit/miss ratio
- Blockchain node sync status
- Withdrawal queue length
- Balance discrepancies

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -p 5433 -U easyx -d easyx
```

**API not starting**
```bash
# Check logs
docker logs easyx-api

# Common causes:
# - Missing environment variables
# - Database not ready
# - Port already in use
```

**Prisma errors**
```bash
# Regenerate client
pnpm db:generate

# Reset database (dev only!)
pnpm db:push --force-reset
```

### Support

For issues, create a ticket in the repository.
