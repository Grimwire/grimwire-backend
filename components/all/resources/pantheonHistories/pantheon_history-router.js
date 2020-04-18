const express = require('express');

const PantheonHistories = require('./pantheon_history-model.js');

const router = express.Router();
const {user_restricted, mod_restricted, admin_restricted} = require('../../../users/restricted-middleware.js')
const {log} = require('../../../userLogs/log-middleware.js')

router.get('/', (req, res) => {
  PantheonHistories.find()
  .then(pantheon_histories => {
    res.json(pantheon_histories);
  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to get pantheon_histories' });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  PantheonHistories.findById(id)
  .then(category_to_pantheon => {
    if (category_to_pantheon) {
      res.json(category_to_pantheon)
    } else {
      res.status(404).json({ message: 'Could not find category_to_pantheon with given id.' })
    }
  })
  .catch(err => {res.status(500).json({ message: 'Failed to get pantheon_histories' });});
});


router.post('/', user_restricted, (req, res) => {
  const category_to_pantheonData = req.body;

  PantheonHistories.add(category_to_pantheonData)
  .then(category_to_pantheon => {
    log(req, {}, category_to_pantheon)
    res.status(201).json(category_to_pantheon);
  })
  .catch (err => {
    res.status(500).json({ message: 'Failed to create new category_to_pantheon' });
  });

});

router.put('/:id', user_restricted, async (req, res) => {
  const { id } = req.params;
  const category_to_pantheonData = req.body;

  log(req, await PantheonHistories.findById(id))
  PantheonHistories.update(category_to_pantheonData, id)
  .then(updatedCategoryToPantheon => {
    res.json(updatedCategoryToPantheon);
  })
  .catch (err => {
    res.status(500).json({ message: 'Failed to update category_to_pantheon' });
  });

});

router.delete('/:id', user_restricted, mod_restricted, async (req, res) => {
  const { id } = req.params;
    log(req, await PantheonHistories.findById(id) )
  PantheonHistories.remove(id)
  .then(deleted => {
    res.send("Success.")
  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to delete category_to_pantheon' })
  });
});

module.exports = router;
