const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Service = require("./Service");

const ServicePriceOption = sequelize.define(
  "ServicePriceOption",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Service,
        key: "id",
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    type: {
      type: DataTypes.ENUM("Hourly", "Weekly", "Monthly"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

ServicePriceOption.belongsTo(Service, {
  foreignKey: "serviceId",
  onDelete: "CASCADE",
});
Service.hasMany(ServicePriceOption, { foreignKey: "serviceId" });

module.exports = ServicePriceOption;
