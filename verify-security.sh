#!/bin/bash

# CyberShield Security Verification Script
# This script verifies that all security measures are properly implemented

echo "🔐 CyberShield Security Verification"
echo "===================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Function to check and report
check() {
    local test_name="$1"
    local test_command="$2"
    
    printf "%-50s" "$test_name:"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED=1
    fi
}

# 1. Check that .env.example contains no real secrets
echo "1. Environment Variables Security"
echo "---------------------------------"
check "No real GitHub Client ID in .env.example" "! grep -q 'Ov23lia45eitwAS1qbWz' .env.example"
check "No real GitHub Client Secret in .env.example" "! grep -q '3a72901bb03a117400717cad61670966e4cd79c4' .env.example"
check "No real MongoDB username in .env.example" "! grep -q 'vkprajapati529' .env.example"
check "No real MongoDB password in .env.example" "! grep -q 'es1xRExTOoiOppaC' .env.example"
check ".env.example contains placeholder values" "grep -q 'your-github-oauth-client-id-here' .env.example"
echo

# 2. Check git ignore rules
echo "2. Git Security"
echo "---------------"
check ".env files are ignored by git" "echo 'test' > .env && git check-ignore .env && rm .env"
check "Build artifacts (public/) are ignored" "mkdir -p public && echo 'test' > public/test.txt && git check-ignore public/test.txt && rm -rf public"
check "node_modules is ignored" "git check-ignore node_modules || echo 'node_modules/*' | git check-ignore --stdin"
echo

# 3. Check application security
echo "3. Application Security"
echo "-----------------------"
check "Server validates environment variables" "timeout 3 node backend/server.js 2>&1 | grep -q 'Missing required environment variables'"
check "Server detects placeholder values" "cp .env.example .env && timeout 3 bash -c 'NODE_ENV=development node backend/server.js' 2>&1 | grep -q 'Placeholder values detected' && rm .env"
check "Production prevents placeholder values" "cp .env.example .env && timeout 3 bash -c 'NODE_ENV=production node backend/server.js' 2>&1 | grep -q 'Cannot start in production with placeholder values' && rm .env"
echo

# 4. Check documentation
echo "4. Documentation Security"
echo "-------------------------"
check "SECURITY.md exists" "test -f SECURITY.md"
check "README.md has environment setup instructions" "grep -q 'Environment Variables Configuration' README.md"
check "README.md warns about security" "grep -q 'Never commit.*env.*version control' README.md"
echo

# 5. Check build process
echo "5. Build Process"
echo "---------------"
check "Build process works" "npm run build > /dev/null 2>&1"
check "Build creates public directory" "test -d public"
check "Build artifacts are not tracked" "! git status --porcelain 2>/dev/null | grep -q public/"
echo

# Final result
echo "Summary"
echo "-------"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All security checks passed!${NC}"
    echo -e "${GREEN}The repository is secure and ready for development.${NC}"
    echo
    echo "Next steps:"
    echo "1. Copy .env.example to .env"
    echo "2. Replace placeholder values with your real credentials"
    echo "3. Follow the setup instructions in README.md"
    echo "4. Review SECURITY.md for additional security guidelines"
    exit 0
else
    echo -e "${RED}❌ Some security checks failed!${NC}"
    echo -e "${YELLOW}Please review the failed checks and fix the issues.${NC}"
    echo "Refer to SECURITY.md for detailed guidance."
    exit 1
fi