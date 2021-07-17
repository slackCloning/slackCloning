const Sequelize = require('sequelize');

module.exports = class Channel extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Channel',
            tableName: 'channels',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
        db.Channel.belongsTo(db.User, { foreignKey: 'userId', sourceKey: 'id' });
        db.Channel.hasMany(db.Post, { foreignKey: 'channelId', sourceKey: 'id' });
        db.Channel.hasMany(db.ChannelUserList, { foreignKey: 'channelId', sourceKey: 'id' });
    }
}