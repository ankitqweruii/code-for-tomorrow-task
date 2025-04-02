const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Category = require("./Category");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM("Normal", "VIP"),
      allowNull: false,
      defaultValue: "Normal",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

Service.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE" });
Category.hasMany(Service, { foreignKey: "categoryId" });

module.exports = Service;
