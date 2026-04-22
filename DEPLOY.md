# MiniPosman Docker Deployment

Production-ready Docker Compose setup for MiniPosman (Django + Next.js + PostgreSQL + Nginx).

## 🏗️ Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Nginx   │────▶│ Frontend │────▶│ Backend  │
│   :80    │     │ Next.js  │     │ Django   │
└──────────┘     │  :3000   │     │  :8000   │
                 └──────────┘     └────┬─────┘
                                       │
                                  ┌────┴─────┐
                                  │PostgreSQL│
                                  │  :5432   │
                                  └──────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd /path/to/miniPosman
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with your settings
```

**Required changes:**
- `DJANGO_SECRET_KEY`: Generate with `openssl rand -base64 32`
- `DJANGO_ALLOWED_HOSTS`: Your server's IP or domain
- `CORS_ALLOWED_ORIGINS`: Your frontend URL
- `POSTGRES_PASSWORD`: Secure database password

### 3. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:

```bash
docker-compose build
docker-compose up -d
```

### 4. Access

- **Frontend**: http://your-server-ip
- **API**: http://your-server-ip/api/

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Service orchestration |
| `backend/Dockerfile` | Django + ASGI (Uvicorn) |
| `backend/entrypoint.sh` | DB migration + startup |
| `frontend/Dockerfile` | Next.js production build |
| `nginx/nginx.conf.template` | Reverse proxy config |
| `.env.example` | Environment variables template |
| `deploy.sh` | One-command deployment script |

## ⚙️ Configuration

### Environment Variables

```bash
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost,http://your-domain.com

# Database
POSTGRES_DB=miniposman
POSTGRES_USER=miniposman
POSTGRES_PASSWORD=secure-password

# Frontend
NEXT_PUBLIC_API_URL=/api

# Nginx
NGINX_SERVER_NAME=localhost
```

### ASGI vs WSGI

This setup uses **ASGI with Uvicorn workers**:
- ✅ Better for I/O-bound operations (making external HTTP requests)
- ✅ Handles concurrent requests more efficiently
- ✅ Supports WebSockets (if needed in future)

To use WSGI instead, edit `backend/entrypoint.sh` and change the gunicorn command to use `api_tool.wsgi:application` without the `-k uvicorn.workers.UvicornWorker` flag.

## 🔧 Management Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Run Django management commands
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py migrate

# Database backup
docker-compose exec db pg_dump -U miniposman miniposman > backup.sql

# Database restore
cat backup.sql | docker-compose exec -T db psql -U miniposman miniposman

# Update and redeploy
docker-compose pull
docker-compose up -d --build
```

## 🔒 HTTPS with Let's Encrypt (Optional)

For HTTPS support, add to `nginx/nginx.conf.template`:

```nginx
server {
    listen 443 ssl http2;
    server_name ${NGINX_SERVER_NAME};

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name ${NGINX_SERVER_NAME};
    return 301 https://$server_name$request_uri;
}
```

Then mount your SSL certificates in `docker-compose.yml`:

```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

## 📊 Monitoring

```bash
# Check service status
docker-compose ps

# Resource usage
docker stats

# Health check
curl http://localhost/health
```

## 🐛 Troubleshooting

**Backend won't start:**
```bash
docker-compose logs backend
# Check if database is ready
docker-compose logs db
```

**Database connection issues:**
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

**Static files not loading:**
```bash
# Rebuild backend to collect static files
docker-compose build backend
docker-compose up -d backend
```

**Permission denied on deploy.sh:**
```bash
chmod +x deploy.sh
```

## 📝 Notes

- Database data persists in Docker volume `postgres_data`
- Static files are served by Nginx from shared volume
- Backend auto-runs migrations on startup
- All services restart automatically unless stopped

## 🔄 Updates

To update the application:

1. Pull latest code
2. Rebuild: `docker-compose build`
3. Restart: `docker-compose up -d`
4. Migrations run automatically

Or simply run `./deploy.sh` again.
