
module.exports = function MotorcycleConstructor(sequelize, DataTypes) {
  const Motorcycle = sequelize.define('Motorcycle', {
    model: DataTypes.STRING,
    year: DataTypes.STRING,
  });

  return Motorcycle;
};
