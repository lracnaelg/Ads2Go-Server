const gql = require('graphql-tag');

const typeDefs = gql`
  enum DriverAccountStatus {
    PENDING
    ACTIVE
    SUSPENDED
    APPROVED
    REJECTED
    RESUBMITTED
  }

  enum DeviceStatus {
    ONLINE
    OFFLINE
    ERROR
  }

  enum InstalledMaterialType {
    LCD
    BANNER
    HEADDRESS
    STICKER
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
    installedMaterialType: InstalledMaterialType
    deviceStatus: DeviceStatus!
    qrCodeIdentifier: String!
    isEmailVerified: Boolean!
    emailVerificationCode: String
    emailVerificationCodeExpires: String
    lastLogin: String
    preferredMaterialType: [InstalledMaterialType!]
    adminOverride: Boolean
    approvalDate: String
    rejectedReason: String
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
    firstName: String!
    lastName: String!
    contactNumber: String!
    email: String!
    password: String!
    address: String!
    licenseNumber: String!
    licensePictureURL: String!
    vehiclePlateNumber: String!
    vehicleType: String!
    vehicleModel: String!
    vehicleYear: Int!
    vehiclePhotoURL: String!
    orCrPictureURL: String!
    installedMaterialType: InstalledMaterialType
    preferredMaterialType: [InstalledMaterialType!]
  }

  input UpdateDriverInput {
    firstName: String
    lastName: String
    contactNumber: String
    email: String
    password: String
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
    installedMaterialType: InstalledMaterialType
    preferredMaterialType: [InstalledMaterialType!]
  }

  input ResubmitDriverInput {
    firstName: String
    lastName: String
    contactNumber: String
    email: String
    password: String
    address: String
    licenseNumber: String
    licensePictureURL: String
    vehiclePlateNumber: String
    vehicleType: String
    vehicleModel: String
    vehicleYear: Int
    vehiclePhotoURL: String
    orCrPictureURL: String
    preferredMaterialType: [InstalledMaterialType!]
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
    approveDriver(id: ID!, materialTypeOverride: [InstalledMaterialType]): DriverResponse!
    rejectDriver(id: ID!, reason: String!): DriverResponse!
    resubmitDriver(id: ID!, input: ResubmitDriverInput!): DriverResponse!
  }
`;

module.exports = typeDefs;
