const Sequelize = require('sequelize');

module.exports = class Chat extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            chat: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Chat',
            tableName: 'chats',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
        db.Chat.belongsTo(db.Dm, { foreignKey: 'dmsId', targetKey: 'dmsId' });
        db.Chat.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });

    }
}