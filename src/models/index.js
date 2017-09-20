const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(module.filename);

module.exports = {};

module.exports.Sequelize = Sequelize;
module.exports.sequelize = new Sequelize('mainDB', null, null, {
  dialect: 'sqlite',
  storage: './test.sqlite',
});
const models = {};
module.exports.models = models;

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0 && file !== basename))
  .forEach((file) => {
    if (file.slice(-3) !== '.js') return;
    const model = module.exports.sequelize.import(path.join(__dirname, file));
    const name = model.name;
    models[name.charAt(0).toUpperCase() + name.slice(1)] = model;
  });

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});


module.exports.Motorcycle = models.Motorcycle;
