'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Settings', [
      {
        id: '5a686b44-29f1-4ddf-bd00-67559e9159aa',
        name: 'logo',
        value: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6b9c51a0-debf-4fd9-a17d-8782e752174c',
        name: 'favicon',
        value: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '10875a3d-499e-44b4-ae96-201abbd389b8',
        name: 'name',
        value: 'cms',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'd6e202e8-82b7-46c9-b8aa-97e76c72121c',
        name: 'language',
        value: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '0915ea43-9fd3-4430-8709-cc158ffe7a16',
        name: 'description',
        value: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '92798e82-542b-45c1-be7b-e8eedd5c50b1',
        name: 'keyWords',
        value: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Settings', null, {});
  },
};
