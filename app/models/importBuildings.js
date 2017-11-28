const Building = require('../models/building');
const Unit = require('../models/unit');
const geoLocation = require('../services/geoLocationHelper');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const _groupUnitsByBuilding = (units) => {
    const unitsByBuilding = units.reduce((buildings, unit) => {
        const { address } = unit;
        buildings[address] = buildings[address] || [];
        buildings[address].push(unit);
        return buildings;
    }, {});
    return unitsByBuilding;
};

const _readFileAsync = filename => new Promise((resolve, reject) => {
    try {
        fs.readFile(filename, 'utf8', (error, buffer) => {
            if (error) {
                reject(error);
            }
            resolve(buffer);
        });
    } catch (error) {
        reject(error);
    }
});

const parseCsv = async(filePath) => {
    const fileData = await _readFileAsync(filePath);
    const units = await parse(fileData, { columns: true });
    const unitsByBuilding = await _groupUnitsByBuilding(units);
    return unitsByBuilding;
};

const _createBuilding = async(buildingData) => {
    const {
        address,
        city,
        state,
        zipCode,
        numberOfUnits
    } = buildingData;
    const newBuilding = {
        address,
        city,
        state,
        zipCode,
        numberOfUnits
    };
    const addressString = `${buildingData.address} ${buildingData.city} ${buildingData.zipCode}`;
    const geocodedData = await geoLocation.geocoder.geocode(addressString);

    newBuilding.latitude = geocodedData[0].latitude;
    newBuilding.longitude = geocodedData[0].longitude;

    const createdBuilding = await Building.create(newBuilding);
    return createdBuilding;
};

const _buildingByAddressQuery = address => ({
    where: {
        address
    }
});

const _findOrCreateBuilding = async(buildingData) => {
    const { address } = buildingData;
    const query = _buildingByAddressQuery(address);
    const existingBuilding = await Building.findOne(query);

    if (existingBuilding) {
        return existingBuilding;
    }

    const createdBuilding = await _createBuilding(buildingData);
    return createdBuilding;
};

const _unitsForBuildingQuery = buildingId => ({
    where: {
        buildingId
    }
});

const _findExistingUnitsForBuilding = async query => Unit.findAll(query);

const _existingUnitNumbers = (existingUnitsForBuilding) => {
    if (existingUnitsForBuilding) {
        return existingUnitsForBuilding
            .map(unit => unit.dataValues.unitNumber);
    }
    return null;
};

const _unitExists = (number, existingNumbers) => !existingNumbers.includes(parseInt(number, 10));

const _createUnit = async(buildingId, unitData) => {
    const {
        unitNumber,
        price,
        haveKeys,
        squareFeet,
        numberOfBathrooms
    } = unitData;
    const unitRecord = await Unit.create({
        buildingId,
        unitNumber,
        price,
        haveKeys,
        squareFeet,
        numberOfBathrooms
    });
    return unitRecord;
};

const _findOrCreateUnitsForBuilding = async(buildingRecord, unitsForBuilding) => {
    const buildingId = buildingRecord.dataValues.id;
    const query = _unitsForBuildingQuery(buildingId);
    const existingUnitsForBuilding = await _findExistingUnitsForBuilding(query);
    const existingUnitNumbers = await _existingUnitNumbers(existingUnitsForBuilding);
    return Promise.all(unitsForBuilding.map(async(unitData) => {
        const { unitNumber } = unitData;
        if (_unitExists(unitNumber, existingUnitNumbers)) {
            return _createUnit(buildingId, unitData);
        }
        return null;
    }));
};

const importUnits = async(unitsByBuilding) => {
    const unitRecordsByBuildingRecord = { buildings: [] };
    await Promise.all(Object.keys(unitsByBuilding).map(async(building) => {
        const unitsForBuilding = unitsByBuilding[building];
        const firstUnit = unitsForBuilding[0];
        const {
            address,
            city,
            state,
            zipCode,
            numberOfUnits
        } = firstUnit;
        const buildingData = {
            address,
            city,
            state,
            zipCode,
            numberOfUnits
        };
        const buildingRecord = await _findOrCreateBuilding(buildingData);
        const unitRecords = await _findOrCreateUnitsForBuilding(buildingRecord, unitsForBuilding);
        unitRecordsByBuildingRecord.buildings.push(buildingRecord, unitRecords);
        return unitRecordsByBuildingRecord;
    }));
};

const ImportBuildings = {
    parseCsv,
    importUnits
};

module.exports = ImportBuildings;