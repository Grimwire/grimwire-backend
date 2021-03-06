const express = require('express');

const CategoryPrereqs = require('./category_prerequisite-model.js');

const router = express.Router();
const {user_restricted, mod_restricted, admin_restricted} = require('../../../users/restricted-middleware.js')
const {log} = require('../../../userLogs/log-middleware.js')

router.get('/', (req, res) => {
  CategoryPrereqs.find()
  .then(category_prereqs => {
    res.json(category_prereqs);
  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to get category_prereqs' });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  CategoryPrereqs.findById(id)
  .then(category_prereq => {
    if (category_prereq) {
      res.json(category_prereq)
    } else {
      res.status(404).json({ message: 'Could not find category_prereq with given id.' })
    }
  })
  .catch(err => {res.status(500).json({ message: 'Failed to get category_prereqs' });});
});


router.post('/', user_restricted, (req, res) => {
  const category_prereqData = req.body;

  CategoryPrereqs.add(category_prereqData)
  .then(category_prereq => {
    log(req, {}, category_prereq)
    res.status(201).json(category_prereq);
  })
  .catch (err => {
    res.status(500).json({ message: 'Failed to create new category_prereq' });
  });

});

router.put('/:id', user_restricted, async (req, res) => {
  const { id } = req.params;
  const category_prereqData = req.body;


  log(req, await CategoryPrereqs.findById(id))
  CategoryPrereqs.update(category_prereqData, id)
  .then(updatedCategoryPrereq => {
    res.json(updatedCategoryPrereq);
  })
  .catch (err => {
    res.status(500).json({ message: 'Failed to update category_prereq' });
  });

});

router.delete('/:id',user_restricted, mod_restricted, async (req, res) => {
  const { id } = req.params;
    log(req, await CategoryPrereqs.findById(id) )
  CategoryPrereqs.remove(id)
  .then(deleted => {
    res.send("Success.")
  })
  .catch(err => {
    res.status(500).json({ message: 'Failed to delete category_prereq' })
  });
});

module.exports = router;
