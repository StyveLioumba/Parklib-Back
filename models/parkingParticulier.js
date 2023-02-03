'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ParkingParticulier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ParkingParticulier.belongsTo(models.User);
      ParkingParticulier.belongsTo(models.Post);
      ParkingParticulier.hasMany(models.Favorite);      
    }
  };
  ParkingParticulier.init({
    address: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    city: DataTypes.STRING,
    lattitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    isActivated: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'ParkingParticulier',
  });
  return ParkingParticulier;
};