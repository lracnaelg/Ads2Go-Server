const gql = require('graphql-tag');

const typeDefs = gql`
  enum UserRole {
    USER
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    houseAddress: String!
    contactNumber: String!
    role: UserRole!
    isEmailVerified: Boolean!
    lastLogin: String
    createdAt: String!
    updatedAt: String!
  }

  type ResponseMessage {
    success: Boolean!
    message: String!
  }

  type Session {
    sessionId: String!
    deviceInfo: DeviceInfo!
    createdAt: String!
    lastActivity: String!
  }

  type DeviceInfo {
    userAgent: String!
    ip: String!
    platform: String!
  }

  type PasswordStrength {
    score: Float!
    strong: Boolean!
    errors: PasswordErrors
  }

  type PasswordErrors {
    length: String
    hasUpperCase: String
    hasLowerCase: String
    hasNumbers: String
    hasSpecialChar: String
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    houseAddress: String!
    contactNumber: String!
  }

  input UpdateUserInput {
    name: String
    houseAddress: String
    contactNumber: String
  }

  input DeviceInfoInput {
    deviceId: String!
    deviceType: String!
    deviceName: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type VerificationResponse {
    success: Boolean!
    message: String
    token: String
  }

  type Query {
    # Admin queries
    getAllUsers: [User!]!
    getUserById(id: ID!): User
    getUserSessions(userId: ID!): [Session!]!
    
    # User queries
    me: User
    checkPasswordStrength(password: String!): PasswordStrength!
    getMyActiveSessions: [Session!]!
  }

  type Mutation {
    # User mutations
    createUser(input: CreateUserInput!): AuthPayload!
    updateUser(input: UpdateUserInput!): User!
    deleteUser(id: ID!): ResponseMessage!
    login(email: String!, password: String!, deviceInfo: DeviceInfoInput!): AuthPayload!
    logout: Boolean!
    logoutAllSessions: Boolean!
    
    # Email verification
    verifyEmail(code: String!): VerificationResponse
    resendVerificationCode(email: String!): VerificationResponse
    
    # Password management
    requestPasswordReset(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
  }
`;

module.exports = typeDefs;
