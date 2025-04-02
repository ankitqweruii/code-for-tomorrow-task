const Category = require("../models/Category");
const Service = require("../models/Service");
const { sequelize } = require("../config/db");

const createCategory = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name } = req.body;

    if (!name) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      where: { name },
      transaction: t,
    });

    if (existingCategory) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({ name }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
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

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateCategory = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Category name is required",
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

    const existingCategory = await Category.findOne({
      where: { name },
      transaction: t,
    });

    if (existingCategory && existingCategory.id !== parseInt(categoryId)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    await category.update({ name }, { transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
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

const deleteCategory = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const servicesCount = await Service.count({
      where: { categoryId },
      transaction: t,
    });

    if (servicesCount > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with services",
      });
    }

    await category.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
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
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
