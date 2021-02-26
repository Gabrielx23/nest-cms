'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Pages', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        autoIncrement: false,
        unique: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      isPage: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      template: {
        type: Sequelize.STRING,
        defaultValue: 'basic',
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'set null',
      },
      thumbnail: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metaDescription: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Pages');
  },
};
