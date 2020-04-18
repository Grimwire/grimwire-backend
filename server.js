const express = require('express');
const server = express();
const cors = require('cors');
server.use(cors());
server.use(express.json());
require('dotenv').config();

//These are the routes for logs, sources, and images, providing much of the supporting data.
const LogRouter = require('./components/userLogs/log-router.js');
const FeedbackRouter = require('./components/feedback/feedback-router.js');
const SourceRouter = require('./components/sources/source-router.js');
const ImageRouter = require('./components/images/image-router.js');
//These are the main data resources, what we care about.
const PantheonRouter = require('./components/pantheons/pantheon-router.js');
const KindRouter = require('./components/kinds/kind-router.js');
const CategoryRouter = require('./components/categories/category-router.js');
const SymbolRouter = require('./components/symbols/symbol-router.js');
//Extra components
const ResourceRouter = require('./components/resources/resource-router.js')
//User Information
const UserRouter = require('./components/users/user-router.js');
//Router for doing the "all" searching & random pages
const AllRouter = require('./components/all/all-router.js');

//Log all creates & edits with the user who did so. Ability to view logs & undo changes.
server.use('/api/all', AllRouter);
server.use('/api/logs', LogRouter);
server.use('/api/feedback', FeedbackRouter);
//Sources provide a link to an external website where we find our information. Attached to all in main database.
server.use('/api/sources', SourceRouter);
//Thumbnail & image gallery functionality.
server.use('/api/images', ImageRouter);
//Main database
server.use('/api/pantheons', PantheonRouter);
server.use('/api/kinds', KindRouter);
server.use('/api/categories', CategoryRouter);
server.use('/api/symbols', SymbolRouter);
//Extra Components
server.use('/api/resources', ResourceRouter);

//User & auth information
server.use('/api/users', UserRouter);

server.get('/', (req, res) => {
  res.send("GrimWire API Connected");
});

module.exports = server;
