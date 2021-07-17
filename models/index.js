const Sequelize = require("sequelize");
const User = require("./user");
const Post = require("./post");
const Channel = require("./channel");
const Comment = require("./comment");
const Chat = require("./chat");
const Dm = require("./dm");
const ChannelUserList = require("./channelUserlist");

const env = process.env.NODE_ENV || 'development';
const config = require("../config/config")[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Channel = Channel;
db.Comment = Comment;
db.Dm = Dm;
db.Chat = Chat;
db.ChannelUserList = ChannelUserList;

User.init(sequelize);
Post.init(sequelize);
Channel.init(sequelize);
Comment.init(sequelize);
Dm.init(sequelize);
Chat.init(sequelize);
ChannelUserList.init(sequelize);

User.associate(db);
Post.associate(db);
Channel.associate(db);
Comment.associate(db);
Dm.associate(db);
Chat.associate(db);
ChannelUserList.associate(db);

module.exports = db;
