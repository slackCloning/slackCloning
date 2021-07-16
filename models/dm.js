const Sequelize = require('sequelize');
const User = require("./user");

module.exports = class Dm extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: User,
                    key: 'id'
                }
            },
            otherUserId: {
                type: Sequelize.INTEGER,
                references: {
                    model: User,
                    key: 'id'
                }
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Dm',
            tableName: 'dms',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
        // db.Dm.belongsToMany(db.User, { through: 'Dm', as: 'Parents', foreignKey: 'userId', targetKey: 'id' });
        // db.Dm.belongsToMany(db.User, { through: 'Dm', as: 'Siblings', foreignKey: 'otherUserId', targetKey: 'id' });
        db.Dm.hasMany(db.Chat, { foreignKey: 'dmsId', sourceKey: 'id' });
    }
}