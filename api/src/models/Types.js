const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // define the model
  sequelize.define('types', {

    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      unique:true,
      // autoIncrement : true,
      allowNull:false,
      primaryKey: true 
  },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
