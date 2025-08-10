const { gql } = require('graphql-tag');

module.exports = gql`
  enum MaterialCategory {
    DIGITAL
    NON_DIGITAL
  }

  enum VehicleType {
    CAR
    MOTOR
    BUS
    JEEP
    E_TRIKE
  }

  enum MaterialType {
    POSTER
    LCD
    STICKER
    LCD_HEADDRESS
    BANNER
  }

  type Material {
    id: ID!
    vehicleType: VehicleType!
    materialType: MaterialType!
    description: String
    requirements: String
    category: MaterialCategory!
    driverId: ID
    mountedAt: String
    dismountedAt: String
    createdAt: String
    updatedAt: String
  }

  input CreateMaterialInput {
    vehicleType: VehicleType!
    materialType: MaterialType!
    description: String
    requirements: String
    category: MaterialCategory!
  }

  input UpdateMaterialInput {
    vehicleType: VehicleType
    materialType: MaterialType
    description: String
    requirements: String
    category: MaterialCategory
    mountedAt: String
    dismountedAt: String
    driverId: ID
  }

  extend type Query {
    getAllMaterials: [Material!]!
    getMaterialById(id: ID!): Material
    getMaterialsByCategory(category: MaterialCategory!): [Material!]!
  }

  type Mutation {
    createMaterial(input: CreateMaterialInput!): Material
    updateMaterial(id: ID!, input: UpdateMaterialInput!): Material
    deleteMaterial(id: ID!): String
    assignMaterialToDriver(driverId: ID!): Material
  }
`;
