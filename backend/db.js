const { Sequelize } = require('sequelize');
const initModels = require('./models/init-models');

const sequelize = new Sequelize(process.env.DB_URI);

sequelize.authenticate()
  .then(() => console.log("Successfully connected to DB"))
  .catch(err => console.log(err));

module.exports = initModels(sequelize);
