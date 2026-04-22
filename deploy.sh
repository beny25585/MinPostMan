#!/bin/bash

set -e

echo "🚀 MiniPosman Production Deployment"
echo "===================================="
echo ""

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create a .env file first:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env with your configuration."
    exit 1
fi

echo "📦 Building and starting services..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Services started!"
echo ""
echo "Access your application:"
echo "  🌐 Frontend: http://localhost"
echo "  🔌 API: http://localhost/api/"
echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop:          docker-compose down"
echo "  Restart:       docker-compose restart"
echo "  Update:        docker-compose pull && docker-compose up -d"
echo ""
echo "Database migrations and static files are handled automatically on startup."
