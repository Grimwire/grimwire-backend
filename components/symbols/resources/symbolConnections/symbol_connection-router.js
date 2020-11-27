const express = require('express');

const SymbolConnections = require('./symbol_connection-model.js');

const router = express.Router();

const {user_restricted, mod_restricted, admin_restricted} = require('../../../users/restricted-middleware.js')
const {log} = require('../../../userLogs/log-middleware.js')

router.get('/', (req, res) => {
  SymbolConnections.find()
  .then(symbol_connections => {
    res.json(symbol_connections);
  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to get symbol_connections' });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  SymbolConnections.findById(id)
  .then(category_to_pantheon => {
    if (category_to_pantheon) {
      res.json(category_to_pantheon)
    } else {
      res.status(404).json({ message: 'Could not find category_to_pantheon with given id.' })
    }
  })
  .catch(err => {res.status(500).json({ message: 'Failed to get symbol_connections' });});
});



router.post('/', user_restricted, (req, res) => {
  const data = req.body;
  let duplicateConnection = data.duplicateConnection
  delete data.duplicateConnection

  SymbolConnections.add(data)
  .then(symbol => {
    if(true) {
      const main_id = data.main_symbol_id
      const connect_id = data.connected_symbol_id
      const relationship = data.connection_relationship
      //In cases 2 & 5, they stay the same.
      switch(relationship){
        case 0:
          data.connection_relationship = 1
          break;
        case 1:
          data.connection_relationship = 0
          break;
        case 3:
          data.connection_relationship = 4
          break;
        case 4:
          data.connection_relationship = 3
          break;
        case 6:
          data.connection_relationship = 7
          break;
        case 7:
          data.connection_relationship = 6
          break;
      }
      data.connected_symbol_id = main_id
      data.main_symbol_id = connect_id
      SymbolConnections.add(data).then(s2 => {
        log(req, {}, symbol)
        log(req, {}, s2)
        res.status(201).json(symbol)
      });
    }
    else {
      log(req, {}, symbol)
      res.status(201).json(symbol);
    }
  })
  .catch (err => {
    res.status(500).json({ message: 'Failed to create new connection' });
  });
})

router.put('/:id', user_restricted, async (req, res) => {
  const { id } = req.params;
  const symbolConnectionData = req.body;

  let og = await SymbolConnections.findById(id)
  let {main_symbol_id, connected_symbol_id} = og

  log(req, await SymbolConnections.findById(id))

  SymbolConnections.update(symbolConnectionData, id)
  .then(async (updatedSymbolConnection) => {

    let inverseConnection = await SymbolConnections.findInverse(main_symbol_id, connected_symbol_id)
    if(inverseConnection) {
      inverseConnection.main_symbol_id = updatedSymbolConnection.connected_symbol_id
      inverseConnection.connected_symbol_id = updatedSymbolConnection.main_symbol_id
      await SymbolConnections.update(inverseConnection, inverseConnection.symbol_connection_id)
    }


    res.json(updatedSymbolConnection);
  })
  .catch (err => {
    res.status(500).json({ message: 'Failed to update category_to_pantheon' });
  });

});

router.delete('/:id', user_restricted, mod_restricted, async (req, res) => {
  const { id } = req.params;
    log(req, await SymbolConnections.findById(id) )
  SymbolConnections.remove(id)
  .then(deleted => {
    res.send("Success.")
  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to delete category_to_pantheon' })
  });
});

module.exports = router;
