require('dotenv').config();

const { SequelizeAuto } = require('sequelize-auto');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URI);

const options = {
  directory: './models'
};

const auto = new SequelizeAuto(sequelize, null, null, options)
auto.run();
