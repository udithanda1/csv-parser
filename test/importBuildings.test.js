const db = require('../app/services/database');
const Building = require('../app/models/building');
const Unit = require('../app/models/unit');
const importBuildings = require('../app/models/importBuildings');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const { expect } = chai;

describe('importBuildings', () => {
    const filePath = 'test/test-data.csv';
    const columnMismatchFilePath = 'test/column-mismatch-test-data.csv';
    const invalidDelimiterFilePath = 'test/invalid-delimiter-test-data.csv';
    const addressValue = '1460 Broadway';
    const cityValue = 'New York';
    const stateValue = 'NY';
    const zipCodeValue = '10036';
    const unitNumberValue = '555';
    const numberOfUnitsValue = '10';
    const latitudeValue = 'latitude-value';
    const longitudeValue = 'longitude-value';
    const priceValue = '1000';
    const haveKeysValue = 'true';
    const squareFeetValue = '800';
    const numberOfBathroomsValue = '1';

    const addressValue2 = '144 Grand Street';
    const cityValue2 = 'New York';
    const stateValue2 = 'NY';
    const zipCodeValue2 = '10013';
    const unitNumberValue2 = '666';
    const numberOfUnitsValue2 = '14';
    const latitudeValue2 = 'latitude-value';
    const longitudeValue2 = 'longitude-value';
    const priceValue2 = '1300';
    const haveKeysValue2 = 'false';
    const squareFeetValue2 = '1000';
    const numberOfBathroomsValue2 = '2';

    const newBuilding = {
        address: addressValue,
        city: cityValue,
        state: stateValue,
        zipCode: zipCodeValue,
        numberOfUnits: numberOfUnitsValue,
        latitude: latitudeValue,
        longitude: longitudeValue
    };
    const newBuilding2 = {
        address: addressValue2,
        city: cityValue2,
        state: stateValue2,
        zipCode: zipCodeValue2,
        numberOfUnits: numberOfUnitsValue2,
        latitude: latitudeValue2,
        longitude: longitudeValue2
    };
    const newUnit = {
        buildingId: 1,
        unitNumber: '555',
        price: '1000',
        haveKeys: true,
        squareFeet: 800,
        numberOfBathrooms: 1
    };
    const unitsByBuilding = {
        addressValue: [{
            address: addressValue,
            city: cityValue,
            state: stateValue,
            zipCode: zipCodeValue,
            unitNumber: unitNumberValue,
            numberOfUnits: numberOfUnitsValue,
            price: priceValue,
            haveKeys: haveKeysValue,
            squareFeet: squareFeetValue,
            numberOfBathrooms: numberOfBathroomsValue
        }],
        addressValue2: [{
            address: addressValue2,
            city: cityValue2,
            state: stateValue2,
            zipCode: zipCodeValue2,
            unitNumber: unitNumberValue2,
            numberOfUnits: numberOfUnitsValue2,
            price: priceValue2,
            haveKeys: haveKeysValue2,
            squareFeet: squareFeetValue2,
            numberOfBathrooms: numberOfBathroomsValue2
        }]
    };
    const parsedCsv = {
        '1460 Broadway': [{
                address: '1460 Broadway',
                city: 'New York',
                state: 'NY',
                zipCode: '10036',
                unitNumber: '555',
                numberOfUnits: '10',
                price: '1000',
                haveKeys: 'true',
                squareFeet: '800',
                numberOfBathrooms: '1'
            },
            {
                address: '1460 Broadway',
                city: 'New York',
                state: 'NY',
                zipCode: '10036',
                unitNumber: '333',
                numberOfUnits: '10',
                price: '1200',
                haveKeys: 'false',
                squareFeet: '900',
                numberOfBathrooms: '1.5'
            }
        ],
        '144 Grand Street': [{
                address: '144 Grand Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10013',
                unitNumber: '666',
                numberOfUnits: '14',
                price: '1300',
                haveKeys: 'false',
                squareFeet: '1000',
                numberOfBathrooms: '2'
            },
            {
                address: '144 Grand Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10013',
                unitNumber: '777',
                numberOfUnits: '14',
                price: '1400',
                haveKeys: 'true',
                squareFeet: '1100',
                numberOfBathrooms: '2.5'
            }
        ]
    };

    describe('importBuildings unit tests', () => {
        let sandbox = null;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
            sandbox && sandbox.restore();
        });

        describe('#parseCsv', () => {
            context('the CSV file cannot be found or is unreadable', () => {
                it('should raise an error', (done) => {
                    const fileNotFoundError = 'Error: ENOENT: no such file or directory, open \'/fake-path.csv\'';
                    importBuildings.parseCsv('/fake-path.csv')
                        .catch((error) => {
                            expect(error.toString()).to.eql(fileNotFoundError);
                            done();
                        })
                        .catch(error => done(error));
                });
            });

            context('a row in the CSV does not have the correct number of fields', () => {
                it('should raise a column mismatch error', (done) => {
                    const fsReadFileSpy = sandbox.spy(fs, 'readFile');
                    const columnError = 'Error: Number of columns on line 2 does not match header';
                    importBuildings.parseCsv(columnMismatchFilePath)
                        .catch((error) => {
                            expect(fsReadFileSpy.called).to.eql(true);
                            expect(error.toString()).to.eql(columnError);
                            done();
                        })
                        .catch(error => done(error));
                });
            });

            context('the CSV has invalid data', () => {
                it('should raise an invalid data error', (done) => {
                    const fsReadFileSpy = sandbox.spy(fs, 'readFile');
                    const invalidDelimiterError = 'Error: Invalid closing quote at line 1; found "s" instead of delimiter ","';
                    importBuildings.parseCsv(invalidDelimiterFilePath)
                        .catch((error) => {
                            expect(fsReadFileSpy.called).to.eql(true);
                            expect(error.toString()).to.eql(invalidDelimiterError);
                            done();
                        })
                        .catch(error => done(error));
                });
            });

            context('all the fields in the CSV are valid', () => {
                it('should convert the string into an array of objects with header values as keys', async() => {
                    const output = await importBuildings.parseCsv(filePath);
                    expect(output).to.eql(parsedCsv);
                });
            });
        });
    });

    describe('importBuildings', () => {
        beforeEach((done) => {
            db.sync({ force: true }).then(() => {
                done();
            });
        });

        describe('#importUnits', () => {
            context('when the building does not exist', () => {
                it('creates a new building', async() => {
                    await importBuildings.importUnits(unitsByBuilding);
                    const results = await Building.findAll();
                    expect(results.length).to.eql(2);
                });
            });

            context('when the building already exists', () => {
                it('uses the existing building', async() => {
                    await Building.create(newBuilding);
                    const earlyResults = await Building.findAll();
                    expect(earlyResults.length).to.eql(1);
                    await importBuildings.importUnits(unitsByBuilding);
                    const results = await Building.findAll();
                    expect(results.length).to.eql(2);
                    expect(results[0].dataValues.id).to.eql(1);
                    expect(results[1].dataValues.id).to.eql(2);
                });
            });

            context('when the unit already exists', () => {
                it('should not create a unit', async() => {
                    const unitsForBuildingQuery = { where: { buildingId: 1 } };
                    await Building.create(newBuilding);
                    await Unit.create(newUnit);
                    const earlyResults = await Unit.findAll(unitsForBuildingQuery);
                    expect(earlyResults.length).to.eql(1);
                    await importBuildings.importUnits(unitsByBuilding);
                    const results = await Unit.findAll();
                    expect(results.length).to.eql(2);
                    expect(results[0].dataValues.buildingId).to.eql(1);
                    expect(results[1].dataValues.buildingId).to.eql(2);
                });
            });

            context('when the unit does not already exist', () => {
                it('should create a unit with the building id', async() => {
                    await importBuildings.importUnits(unitsByBuilding);
                    const earlyResults = await Unit.findAll();
                    expect(earlyResults.length).to.eql(2);
                    expect(earlyResults[0].dataValues.buildingId).to.eql(1);
                    expect(earlyResults[1].dataValues.buildingId).to.eql(2);
                });
            });
        });
    });
});