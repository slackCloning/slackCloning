const Sequelize = require('sequelize');

const User = require("./user");

module.exports = class Dm extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            dmsId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
            },

            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: User,
                    key: 'id'
                }

            },
            otherUserId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: User,
                    key: 'id',
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
        db.Dm.hasMany(db.Chat, { foreignKey: 'dmsId', sourceKey: 'dmsId' });
        db.Dm.belongsTo(db.User, { as: 'User', foreignKey: 'userId', targetKey: 'id' });
        db.Dm.belongsTo(db.User, { as: 'OtherUser', foreignKey: 'otherUserId', targetKey: 'id' });
    }
}