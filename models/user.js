const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            nickname: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
        db.User.hasMany(db.Channel, { foreignKey: 'userId', sourceKey: 'id' });
        db.User.hasMany(db.Post, { foreignKey: 'userId', sourceKey: 'id' });
        db.User.hasMany(db.Comment, { foreignKey: 'userId', sourceKey: 'id' });
        db.User.hasMany(db.Comment, { foreignKey: 'userId', sourceKey: 'id' });

        db.User.hasMany(db.Dm, { as: 'Parents', foreignKey: 'userId', sourceKey: 'id' });
        db.User.hasMany(db.Dm, { as: 'Siblings', foreignKey: 'otherUserId', sourceKey: 'id' });

    }
}