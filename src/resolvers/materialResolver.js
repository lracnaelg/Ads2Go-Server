const Material = require('../models/Material');
const Driver = require('../models/Driver'); // Needed for driver info
const { checkAdmin } = require('../middleware/auth');

const allowedMaterialsByVehicle = {
  CAR: ['POSTER', 'LCD', 'STICKER', 'LCD_HEADDRESS', 'BANNER'],
  BUS: ['STICKER', 'LCD_HEADDRESS'],
  JEEP: ['POSTER', 'STICKER'],
  MOTOR: ['LCD', 'BANNER'],
  E_TRIKE: ['BANNER', 'LCD'],
};

module.exports = {
  Query: {
    getAllMaterials: async (_, __, context) => {
      const { user } = context;
      checkAdmin(user);
      return await Material.find().sort({ createdAt: -1 });
    },

    getMaterialsByCategory: async (_, { category }) => {
      if (!['DIGITAL', 'NON_DIGITAL'].includes(category)) {
        throw new Error('Invalid material category');
      }
      return await Material.find({ category }).sort({ createdAt: -1 });
    },

    getMaterialById: async (_, { id }, context) => {
      const { user } = context;
      checkAdmin(user);
      const material = await Material.findById(id);
      if (!material) throw new Error('Material not found');
      return material;
    },
  },

  Mutation: {
    createMaterial: async (_, { input }, context) => {
      const { user } = context;
      checkAdmin(user);

      const { vehicleType, materialType } = input;
      const allowed = allowedMaterialsByVehicle[vehicleType];
      if (!allowed.includes(materialType)) {
        throw new Error(
          `${materialType} is not allowed for vehicle type ${vehicleType}`
        );
      }

      // Create without assigning driver yet
      const material = new Material({
        ...input,
        driverId: null, // No driver assigned yet
      });

      await material.save();
      return material;
    },

    updateMaterial: async (_, { id, input }, context) => {
      const { user } = context;
      checkAdmin(user);

      if (input.vehicleType && input.materialType) {
        const allowed = allowedMaterialsByVehicle[input.vehicleType];
        if (!allowed.includes(input.materialType)) {
          throw new Error(
            `${input.materialType} is not allowed for vehicle type ${input.vehicleType}`
          );
        }
      }

      const updated = await Material.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      });

      if (!updated) throw new Error('Material not found');
      return updated;
    },

    deleteMaterial: async (_, { id }, context) => {
      const { user } = context;
      checkAdmin(user);

      const deleted = await Material.findByIdAndDelete(id);
      if (!deleted) throw new Error('Material not found or already deleted');
      return 'Material deleted successfully.';
    },

    // 🔹 Assign materials to driver upon approval
    assignMaterialsToDriver: async (_, { driverId }, context) => {
      const { user } = context;
      checkAdmin(user);

      const driver = await Driver.findById(driverId);
      if (!driver) throw new Error('Driver not found');

      const allowedTypes = allowedMaterialsByVehicle[driver.vehicleType];
      if (!allowedTypes) {
        throw new Error(`No allowed materials for vehicle type ${driver.vehicleType}`);
      }

      const availableMaterials = await Material.find({
        vehicleType: driver.vehicleType,
        materialType: { $in: allowedTypes },
        driverId: null,
      });

      if (!availableMaterials.length) {
        throw new Error('No available materials to assign');
      }

      // Assign first available material (or all if needed)
      const assignedMaterial = availableMaterials[0];
      assignedMaterial.driverId = driver._id;
      await assignedMaterial.save();

      return assignedMaterial;
    }
  },

  Material: {
    id: (parent) => parent._id.toString(),
  },
};
