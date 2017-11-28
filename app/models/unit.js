const Sequelize = require('sequelize');
const db = require('../services/database');
const Building = require('../models/building');

const modelDefinition = {
    unitId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    unitNumber: {
        type: Sequelize.INTEGER
    },
    price: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    haveKeys: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    squareFeet: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    numberOfBathrooms: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    approvalDate: {
        type: Sequelize.DATE,
        defaultValue: null
    }
};

const UnitModel = db.define('unit', modelDefinition);
UnitModel.belongsTo(Building, { foreignKey: 'buildingId' });

module.exports = UnitModel;