const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('pokemon', {

    id: { 
      type: DataTypes.INTEGER, 
      // defaultValue: DataTypes.INTEGER, 
      unique:true,
      autoIncrement : true,
      allowNull:false,
      primaryKey: true 
  },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
  }
  ,
     {
      timestamps: false,
      freezeTableName: true
    }
  );
};
