#!/bin/bash

# Enstore - Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 Enstore Setup Script"
echo "======================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Step 1: Copy environment files
echo "📝 Step 1: Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
else
    echo "⚠️  .env already exists, skipping..."
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

echo ""

# Step 2: Start Docker containers
echo "🐳 Step 2: Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for containers to be ready (30 seconds)..."
sleep 30

echo ""

# Step 3: Install backend dependencies
echo "📦 Step 3: Installing backend dependencies..."
docker-compose exec -T backend composer install --no-interaction

echo ""

# Step 4: Generate application key
echo "🔑 Step 4: Generating application key..."
docker-compose exec -T backend php artisan key:generate --no-interaction

echo ""

# Step 5: Run migrations
echo "🗄️  Step 5: Running database migrations..."
docker-compose exec -T backend php artisan migrate --no-interaction

echo ""

# Step 6: Ask about seeding
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose exec -T backend php artisan db:seed --no-interaction
fi

echo ""

# Step 7: Ask about syncing products
read -p "Do you want to sync Digiflazz products? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Syncing Digiflazz products..."
    docker-compose exec -T backend php artisan digiflazz:sync-products
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🎉 Your application is ready!"
echo ""
echo "📍 Access your applications:"
echo "   - Frontend:    http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - phpMyAdmin:  http://localhost:8080"
echo ""
echo "📚 Useful commands:"
echo "   - View logs:        docker-compose logs -f"
echo "   - Stop services:    docker-compose down"
echo "   - Restart services: docker-compose restart"
echo ""
echo "Happy coding! 🚀"
