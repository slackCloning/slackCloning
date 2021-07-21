const Sequelize = require('sequelize');

module.exports = class ChannelUserList extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ChannelUserList',
            tableName: 'ChannelUserLists',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
        db.ChannelUserList.belongsTo(db.Channel, { foreignKey: 'channelId', sourceKey: 'id' });
        db.ChannelUserList.belongsTo(db.User, { foreignKey: 'userId', sourceKey: 'id' });
    }
}