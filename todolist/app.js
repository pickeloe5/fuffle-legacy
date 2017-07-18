const fuffle = require('../index.js')

fuffle.loadTable('items')

fuffle.routeReader('/', 'index')
fuffle.routeCreator('/add', 'items', 'item_insert', '/')

fuffle.start()
