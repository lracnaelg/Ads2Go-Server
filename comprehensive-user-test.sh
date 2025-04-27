#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GraphQL Endpoint
ENDPOINT="http://localhost:5000/graphql"

# Utility function to run GraphQL queries
run_query() {
    local query="$1"
    local description="$2"
    local token="${3:-}"
    
    echo -e "${BLUE}==== $description ====${NC}"
    
    local curl_cmd="curl -s -X POST -H 'Content-Type: application/json'"
    if [ -n "$token" ]; then
        curl_cmd+=" -H 'Authorization: Bearer $token'"
    fi
    curl_cmd+=" -d '$query' $ENDPOINT"
    
    local response=$(eval "$curl_cmd")
    echo "Full Response:"
    echo "$response" | jq .
    
    local errors=$(echo "$response" | jq '.errors')
    if [ "$errors" != "null" ]; then
        echo -e "${RED}Errors Detected: $(echo "$errors" | jq 'length')${NC}"
        echo "$errors"
        echo -e "${RED}❌ Test Failed: Unexpected GraphQL Errors${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Test Passed: $description${NC}"
        return 0
    fi
}

# Unique test variables with timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
NORMAL_USER_EMAIL="john.test.${TIMESTAMP}@example.com"
NORMAL_USER_PASSWORD="StrongP@ssw0rd123!"
ADMIN_USER_EMAIL="admin.test.${TIMESTAMP}@example.com"
ADMIN_USER_PASSWORD="AdminP@ss123!"

# Comprehensive Test Suite
run_tests() {
    # 1. Password Strength Checks
    run_query '{"query":"query { checkPasswordStrength(password: \"weakpass\") { score strong errors { length hasUpperCase hasLowerCase hasNumbers hasSpecialChar } } }"}' "Weak Password Strength Check"
    
    run_query '{"query":"query { checkPasswordStrength(password: \"StrongP@ssw0rd123!\") { score strong errors { length hasUpperCase hasLowerCase hasNumbers hasSpecialChar } } }"}' "Strong Password Strength Check"

    # 2. User Registration Tests
    local create_user_query='{"query":"mutation { createUser(input: { name: \"John Doe\", email: \"'"$NORMAL_USER_EMAIL"'\", password: \"'"$NORMAL_USER_PASSWORD"'\", houseAddress: \"123 Test Street\", contactNumber: \"+1234567890\" }) { token user { id name email } } }"}'
    local create_user_response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$create_user_query" "$ENDPOINT")
    local normal_user_token=$(echo "$create_user_response" | jq -r '.data.createUser.token // empty')
    
    if [ -z "$normal_user_token" ]; then
        echo -e "${RED}❌ Test Failed: User Registration${NC}"
        echo "Response: $create_user_response"
        return 1
    else
        echo -e "${GREEN}✅ Test Passed: Create Normal User${NC}"
    fi

    # 3. Duplicate Email Registration
    local duplicate_user_query='{"query":"mutation { createUser(input: { name: \"Duplicate User\", email: \"'"$NORMAL_USER_EMAIL"'\", password: \"AnotherPass123!\", houseAddress: \"456 Duplicate Street\", contactNumber: \"+1987654321\" }) { token user { id name email } } }"}'
    local duplicate_response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$duplicate_user_query" "$ENDPOINT")
    local error_message=$(echo "$duplicate_response" | jq -r '.errors[0].message // ""')
    
    if [ -z "$error_message" ] || [ "$error_message" != "User with this email already exists" ]; then
        echo -e "${RED}❌ Test Failed: Duplicate Email Registration${NC}"
        echo "Expected error: 'User with this email already exists'"
        echo "Actual response: $duplicate_response"
        return 1
    else
        echo -e "${GREEN}✅ Test Passed: Duplicate Email Registration${NC}"
    fi

    # 4. Login Tests
    local login_query='{"query":"mutation { login(email: \"'"$NORMAL_USER_EMAIL"'\", password: \"'"$NORMAL_USER_PASSWORD"'\", deviceInfo: { userAgent: \"test\", ip: \"127.0.0.1\", platform: \"Linux\" }) { token user { id name email } } }"}'
    local login_response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$login_query" "$ENDPOINT")
    local user_token=$(echo "$login_response" | jq -r '.data.login.token // empty')
    
    if [ -z "$user_token" ]; then
        echo -e "${RED}❌ Test Failed: Login with Normal User${NC}"
        echo "Response: $login_response"
        return 1
    else
        echo -e "${GREEN}✅ Test Passed: Login with Normal User${NC}"
    fi

    # 5. Invalid Login Attempts
    local invalid_login_query='{"query":"mutation { login(email: \"'"$NORMAL_USER_EMAIL"'\", password: \"WrongPassword123\", deviceInfo: { userAgent: \"test\", ip: \"127.0.0.1\", platform: \"Linux\" }) { token user { id name email } } }"}'
    local invalid_login_response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$invalid_login_query" "$ENDPOINT")
    local login_error_message=$(echo "$invalid_login_response" | jq -r '.errors[0].message // ""')
    
    if [ -z "$login_error_message" ] || [ "$login_error_message" != "Invalid password" ]; then
        echo -e "${RED}❌ Test Failed: Invalid Login Attempt${NC}"
        echo "Expected error: 'Invalid password'"
        echo "Actual response: $invalid_login_response"
        return 1
    else
        echo -e "${GREEN}✅ Test Passed: Invalid Login Attempt${NC}"
    fi

    # 6. Request Password Reset
    local reset_password_query='{"query":"mutation { requestPasswordReset(email: \"'"$NORMAL_USER_EMAIL"'\") }"}'
    run_query "$reset_password_query" "Request Password Reset"

    # 7. Update User Profile
    local update_profile_query='{"query":"mutation { updateUser(input: { name: \"Updated John Doe\", contactNumber: \"+1987654321\" }) { id name contactNumber } }"}'
    run_query "$update_profile_query" "Update User Profile" "$user_token"

    # 8. Create Admin User
    local create_admin_query='{"query":"mutation { createUser(input: { name: \"Admin User\", email: \"'"$ADMIN_USER_EMAIL"'\", password: \"'"$ADMIN_USER_PASSWORD"'\", houseAddress: \"789 Admin Street\", contactNumber: \"+1122334455\" }) { token user { id name email } } }"}'
    local create_admin_response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$create_admin_query" "$ENDPOINT")
    local admin_user_token=$(echo "$create_admin_response" | jq -r '.data.createUser.token // empty')
    
    if [ -z "$admin_user_token" ]; then
        echo -e "${RED}❌ Test Failed: Create Admin User${NC}"
        echo "Response: $create_admin_response"
        return 1
    else
        echo -e "${GREEN}✅ Test Passed: Create Admin User${NC}"
    fi

    # 9. Admin Login
    local admin_login_query='{"query":"mutation { login(email: \"'"$ADMIN_USER_EMAIL"'\", password: \"'"$ADMIN_USER_PASSWORD"'\", deviceInfo: { userAgent: \"test\", ip: \"127.0.0.1\", platform: \"Linux\" }) { token user { id name email role } } }"}'
    local admin_login_response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$admin_login_query" "$ENDPOINT")
    local admin_token=$(echo "$admin_login_response" | jq -r '.data.login.token // empty')
    
    if [ -z "$admin_token" ]; then
        echo -e "${RED}❌ Test Failed: Login with Admin User${NC}"
        echo "Response: $admin_login_response"
        return 1
    else
        echo -e "${GREEN}✅ Test Passed: Login with Admin User${NC}"
    fi

    # 10. Change Password
    local change_password_query='{"query":"mutation { changePassword(currentPassword: \"'"$NORMAL_USER_PASSWORD"'\", newPassword: \"NewStrongP@ss456!\") }"}'
    run_query "$change_password_query" "Change Password" "$user_token"

    # 11. Logout
    local logout_query='{"query":"mutation { logout }"}'
    run_query "$logout_query" "Logout" "$user_token"

    # 12. Delete User Account
    local delete_account_query='{"query":"mutation { deleteUser }"}'
    run_query "$delete_account_query" "Delete User Account" "$user_token"
}

# Run the tests
run_tests

# Exit with the result of the tests
exit $?
