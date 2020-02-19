const express = require('express');
const paginate = require('jw-paginate');
const router = express.Router();


const Symbols = require('./symbol-model.js');
const SymbolConnections = require('./resources/symbolConnections/symbol_connection-model.js');
const SymbolToPantheons = require('./resources/symbolPantheons/symbol_to_pantheon-model.js');
const SymbolResources = require('./resources/symbolResources/symbol_resource-model.js');
const Images = require('../images/image-model.js');
const Sources = require('../sources/source-model.js');


const SymbolConnectionRouter = require('./resources/symbolConnections/symbol_connection-router.js');
const SymbolToPantheonRouter = require('./resources/symbolPantheons/symbol_to_pantheon-router.js');
const SymbolResourceRouter = require('./resources/symbolResources/symbol_resource-router.js');
router.use('/connections', SymbolConnectionRouter);
router.use('/pantheons', SymbolToPantheonRouter);
router.use('/resources', SymbolResourceRouter);

const {user_restricted, mod_restricted, admin_restricted} = require('../users/restricted-middleware.js')
const {log} = require('../userLogs/log-middleware.js')

router.get('/', (req, res) => {
  const sort = req.query.sort || "symbol_name"
  const sortdir = req.query.sortdir || "ASC"
  const searchTerm = req.query.search || ""

  Symbols.find(sort, sortdir, searchTerm)
  .then(symbols => {
    const items = symbols

    // get page from query params or default to first page
    const page = parseInt(req.query.page) || 1;

    // get pager object for specified page
    const pageSize = 100;
    const pager = paginate(items.length, page, pageSize);

    // get page of items from items array
    const pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);

    // return pager object and current page of items
    return res.json({ pager, pageOfItems: pageOfItems.map(item => ({
      ...item,
      thumbnail: {
        image_url: item.image_url,
        thumbnail: item.thumbnail,
        image_title: item.image_title,
        image_description: item.image_description,
        image_id: item.image_id
      }
    })
    )});


  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to get symbols' });
  });
});


router.get('/nameList', (req, res) => {
  Symbols.listOfNames()
  .then(items => {
    res.json(items)
  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to get items' });
  });
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const symbol = await Symbols.findById(id)
  if (symbol) {
    const images = await Images.getImages('Symbol', id)
    const thumbnail = await Images.getThumbnail('Symbol', id)
    const sources = await Sources.getSources('Symbol', id)
    const pantheons = await SymbolToPantheons.findBySymbol(id)
    const connections = await SymbolConnections.findBySymbol(id)
    const kind = await Symbols.findKind(symbol.symbol_kind_id)
    const kindSymbolConnection = await Symbols.findKindConnections(id)
    const resources = await SymbolResources.findBySymbol(id)
    const relatedNameSymbols = await Symbols.findRelatedNames( symbol.symbol_name, id )
    res.json({...symbol, thumbnail, images, relatedNameSymbols, sources, resources, pantheons, connections, kind, kindSymbolConnection })
  } else {
    res.status(404).json({ message: 'Could not find symbol with given id.' })
  }

});

router.post('/', user_restricted,  async (req, res) => {
  const symbolData = req.body;

  if(await Symbols.findByName(symbolData.symbol_name)) {
    res.status(400).json({message: "A record with this name already exists."})
  } else {
    Symbols.add(symbolData)
    .then(symbol => {
      if(symbol){
        log(req, {}, symbol)
        res.status(201).json(symbol);
      }
      else { res.status(500).json({ message: 'Failed to create new symbol' }); }
    })
    .catch (err => {
      res.status(500).json({ message: 'Failed to create new symbol' });
    });
  }
});

router.put('/:id', user_restricted, async (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  if(await Symbols.findByName(changes.symbol_name, id)) {
    res.status(400).json({message: "A record with this name already exists."})
  } else {
    Symbols.findById(id)
    .then(symbol => {
      if (symbol) {
        Symbols.update(changes, id)
        .then(updatedSymbol => {
          log(req, symbol)
          res.json(updatedSymbol);
        });
      } else {
        res.status(404).json({ message: 'Could not find symbol with given id' });
      }
    })
    .catch (err => {
      res.status(500).json({ message: 'Failed to update symbol' });
    });
  }
});

router.delete('/:id', user_restricted, mod_restricted, async (req, res) => {
  const { id } = req.params;
  const item = await Symbols.findById(id)
      Symbols.remove(id)
      .then(deleted => {
        log(req, item )
        res.send("Success.")
      })
      .catch(err => { res.status(500).json({ message: 'Failed to delete symbol' }) });
});

module.exports = router;
