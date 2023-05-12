'use strict';

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
   await queryInterface.bulkInsert('Pictures', [
    {
      url:"https://loremflickr.com/320/240/paris,girl/all",
      PostId:1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      url:"https://loremflickr.com/320/240/paris,girl/all",
      PostId:1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
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
