#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 0.1
done

echo "PostgreSQL started"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting ASGI server..."

exec gunicorn api_tool.asgi:application \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-connections 1000 \
    --timeout 60 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -
