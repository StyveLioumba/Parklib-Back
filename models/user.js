'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.ParkingParticulier);
      User.hasMany(models.RoleUser);
      User.belongsToMany(models.Role, {
        through: models.RoleUser
      });
      User.hasMany(models.Booking);
      User.hasMany(models.Comment);
      User.hasMany(models.Comment, {
        foreignKey: 'AuthorId'
      });
      User.hasMany(models.Favorite)
    }
  };
  User.init({
    firstName: {
      type : DataTypes.STRING,
      defaultValue: "",
    },
    lastName: {
      type : DataTypes.STRING,
      defaultValue: "",
    },
    phone: DataTypes.STRING,
    picture: DataTypes.STRING,
    address: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isActivated: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
