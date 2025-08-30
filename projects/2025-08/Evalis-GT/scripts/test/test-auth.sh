#!/bin/bash

echo "🔧 Testing Evalis Authentication System..."

# Check if server is running
echo "📡 Checking if server is running on port 3000..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Server is running!"
else
    echo "❌ Server is not running. Please start with: npm run server"
    exit 1
fi

# Check Clerk configuration
echo "🔑 Checking Clerk configuration..."
if [ -n "$VITE_CLERK_PUBLISHABLE_KEY" ]; then
    echo "✅ Clerk publishable key is set"
else
    echo "⚠️  Clerk publishable key not found in environment"
fi

if [ -n "$CLERK_SECRET_KEY" ]; then
    echo "✅ Clerk secret key is set"
else
    echo "⚠️  Clerk secret key not found in environment"
fi

# Check database connection
echo "🗄️  Testing database connection..."
curl -s http://localhost:3000/api/health | grep -q "OK" && echo "✅ Database is connected" || echo "❌ Database connection failed"

echo "🚀 You can now test:"
echo "   • Teacher Portal: http://localhost:5174/teacher/sign-in"
echo "   • Student Portal: http://localhost:5174/student/sign-in"
echo "   • Admin Portal: http://localhost:5174/admin/sign-in"

echo ""
echo "💡 Tips for testing:"
echo "   • Use your email to sign up via Clerk"
echo "   • Clerk supports email/password authentication"
echo "   • Session should persist without frequent logouts"
