
module.exports = function MotorcycleConstructor(sequelize, DataTypes) {
  const Link = sequelize.define('Link', {
    workspace: DataTypes.STRING,
    link: DataTypes.STRING,
    last_visited: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  });

  return Link;
};
