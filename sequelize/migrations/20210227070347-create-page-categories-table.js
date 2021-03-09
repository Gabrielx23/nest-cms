'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('PageCategories', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        autoIncrement: false,
        unique: true,
        primaryKey: true,
      },
      pageId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Pages', key: 'id' },
        onDelete: 'cascade',
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onDelete: 'cascade',
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PageCategories');
  },
};
