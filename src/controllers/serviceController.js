const Service = require("../models/Service");
const Category = require("../models/Category");
const ServicePriceOption = require("../models/ServicePriceOption");
const { sequelize } = require("../config/db");

const createService = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { categoryId } = req.params;
    const { name, type, priceOptions } = req.body;

    if (
      !name ||
      !type ||
      !priceOptions ||
      !Array.isArray(priceOptions) ||
      priceOptions.length === 0
    ) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Name, type and at least one price option are required",
      });
    }

    if (!["Normal", "VIP"].includes(type)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Service type must be either Normal or VIP",
      });
    }

    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const service = await Service.create(
      {
        name,
        type,
        categoryId,
      },
      { transaction: t }
    );

    const priceOptionPromises = priceOptions.map((option) => {
      if (!option.duration || !option.price || !option.type) {
        throw new Error(
          "Duration, price and type are required for each price option"
        );
      }

      if (!["Hourly", "Weekly", "Monthly"].includes(option.type)) {
        throw new Error(
          "Price option type must be either Hourly, Weekly, or Monthly"
        );
      }

      return ServicePriceOption.create(
        {
          serviceId: service.id,
          duration: option.duration,
          price: option.price,
          type: option.type,
        },
        { transaction: t }
      );
    });

    await Promise.all(priceOptionPromises);

    const createdService = await Service.findByPk(service.id, {
      include: [ServicePriceOption],
      transaction: t,
    });

    await t.commit();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: createdService,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);

    if (
      error.message.includes("required") ||
      error.message.includes("must be")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getServices = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const services = await Service.findAll({
      where: { categoryId },
      include: [ServicePriceOption],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateService = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { categoryId, serviceId } = req.params;
    const { name, type, priceOptions } = req.body;

    if (!name || !type) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }

    if (!["Normal", "VIP"].includes(type)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Service type must be either Normal or VIP",
      });
    }

    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const service = await Service.findOne({
      where: { id: serviceId, categoryId },
      transaction: t,
    });

    if (!service) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Service not found in the specified category",
      });
    }

    await service.update({ name, type }, { transaction: t });

    if (priceOptions && Array.isArray(priceOptions)) {
      await ServicePriceOption.destroy({
        where: { serviceId },
        transaction: t,
      });

      const priceOptionPromises = priceOptions.map((option) => {
        if (!option.duration || !option.price || !option.type) {
          throw new Error(
            "Duration, price and type are required for each price option"
          );
        }

        if (!["Hourly", "Weekly", "Monthly"].includes(option.type)) {
          throw new Error(
            "Price option type must be either Hourly, Weekly, or Monthly"
          );
        }

        return ServicePriceOption.create(
          {
            serviceId,
            duration: option.duration,
            price: option.price,
            type: option.type,
          },
          { transaction: t }
        );
      });

      await Promise.all(priceOptionPromises);
    }

    const updatedService = await Service.findByPk(serviceId, {
      include: [ServicePriceOption],
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);

    if (
      error.message.includes("required") ||
      error.message.includes("must be")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteService = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { categoryId, serviceId } = req.params;

    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const service = await Service.findOne({
      where: { id: serviceId, categoryId },
      transaction: t,
    });

    if (!service) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Service not found in the specified category",
      });
    }

    await service.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createService,
  getServices,
  updateService,
  deleteService,
};
