const Sequelize = require('sequelize');
const db = require('../services/database');
const modelDefinition = {

    buildingId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    address: {
        type: Sequelize.STRING,
        allownull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    state: {
        type: Sequelize.STRING,
        allowNull: false
    },
    zipCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: false
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: false
    },
    numberOfUnits: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    approvalDate: {
        type: Sequelize.DATE,
        defaultValue: null
    }
};

const BuildingModel = db.define('building', modelDefinition);
module.exports = BuildingModel;