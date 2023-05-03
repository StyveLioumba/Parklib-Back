'use strict';

const bcrypt = require('bcrypt');
const constant = require('../utils/constantes.util.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const password = await bcrypt.hash('password', constant.SALT_HASH_KEY);
    
    await queryInterface.bulkInsert('Users', [
      {
        firstName:"John",
        lastName:"Doe",
        password,
        phone:"0654852514",
        picture: `https://ui-avatars.com/api/?size=200&background=random&name=John+Doe`,
        address: "10 rue du chateau",
        email: "john.doe@yopmail.com",
        isActivated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Cecile",
        lastName:"Ansieux",
        password,
        phone:"0635421598",
        picture: `https://ui-avatars.com/api/?size=200&background=random&name=Cecile+Ansieux`,
        address: "56 rue la mottepiqué",
        email: "cecile.ansieux@yopmail.com",
        isActivated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
