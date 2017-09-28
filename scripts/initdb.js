/* eslint no-loop-func: 0 */

const models = require('../src/models');

models.sequelize.sync({ force: true });
