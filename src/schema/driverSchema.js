const gql = require('graphql-tag');

const typeDefs = gql`

  enum DriverAccountStatus {
    PENDING
    ACTIVE
    SUSPENDED
  }

  enum DeviceStatus {
    ONLINE
    OFFLINE
    ERROR
  }

  type Driver {
    id: ID!
    driverId: String!
    firstName: String!
    lastName: String!
    contactNumber: String!
    email: String!
    address: String!
    licenseNumber: String!
    licensePictureURL: String!
    vehiclePlateNumber: String!
    vehicleType: String!
    vehicleModel: String!
    vehicleYear: Int!
    vehiclePhotoURL: String!
    orCrPictureURL: String!
    accountStatus: DriverAccountStatus!
    dateJoined: String!
    currentBalance: Float!
    totalEarnings: Float!
    totalDistanceTraveled: Float!
    totalAdImpressions: Int!
    installedDeviceId: String
    deviceStatus: DeviceStatus!
    qrCodeIdentifier: String!
    isEmailVerified: Boolean!
    emailVerificationCode: String
    emailVerificationCodeExpires: String
    lastLogin: String
  }

  type DriverResponse {
    success: Boolean!
    message: String!
    driver: Driver
  }

  type AuthPayload {
    token: String!
    driver: Driver!
  }

  input CreateDriverInput {
  driverId: String!
  firstName: String!
  lastName: String!
  contactNumber: String!
  email: String!
  password: String!   # <--- ADD THIS LINE
  address: String!
  licenseNumber: String!
  licensePictureURL: String!
  vehiclePlateNumber: String!
  vehicleType: String!
  vehicleModel: String!
  vehicleYear: Int!
  vehiclePhotoURL: String!
  orCrPictureURL: String!
  qrCodeIdentifier: String!
}


  input UpdateDriverInput {
    firstName: String
    lastName: String
    contactNumber: String
    email: String
    password: String       # <-- Optional: allow password update if you want
    address: String
    licenseNumber: String
    licensePictureURL: String
    vehiclePlateNumber: String
    vehicleType: String
    vehicleModel: String
    vehicleYear: Int
    vehiclePhotoURL: String
    orCrPictureURL: String
    accountStatus: DriverAccountStatus
    deviceStatus: DeviceStatus
  }

  type Query {
    getAllDrivers: [Driver!]!
    getDriverById(id: ID!): Driver
  }

  type Mutation {
    createDriver(input: CreateDriverInput!): DriverResponse!
    updateDriver(id: ID!, input: UpdateDriverInput!): DriverResponse!
    deleteDriver(id: ID!): DriverResponse!

loginDriver(email: String!, password: String!): AuthPayload!
    verifyDriverEmail(code: String!): DriverResponse!
    resendDriverVerificationCode(email: String!): DriverResponse!
  }

`;

module.exports = typeDefs;
