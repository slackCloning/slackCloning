const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
            },
            img: {
                type: Sequelize.STRING,
                defaultValue: null
            },
        }, {
            sequelize,
            timestamps: true,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }

    static associate(db) {
        db.Post.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
        db.Post.belongsTo(db.Channel, { foreignKey: 'channelId', targetKey: 'id' });
        db.Post.hasMany(db.Comment, { foreignKey: 'postId', sourceKey: 'id' });
    }
}