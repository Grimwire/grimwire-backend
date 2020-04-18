const express = require('express');
const paginate = require('jw-paginate')

const Pantheons = require('../pantheons/pantheon-model.js');
const Symbols = require('../symbols/symbol-model.js');
const Kinds = require('../kinds/kind-model.js');
const Categories = require('../categories/category-model.js');

const router = express.Router();

router.get('/', async (req, res) => {
  const sortdir = req.query.sortdir || "ASC"
  const searchTerm = req.query.search || ""

  const pantheons = await Pantheons.find('pantheon_name', sortdir, searchTerm).map(i => ({...i, recordKind: 'pantheon'}) )
  const symbols = await Symbols.find('symbol_name', sortdir, searchTerm).map(i => ({...i, recordKind: 'symbol'}) )
  const kinds = await Kinds.find('kind_name', sortdir, searchTerm).map(i => ({...i, recordKind: 'kind'}) )
  const categories = await Categories.find('category_name', sortdir, searchTerm).map(i => ({...i, recordKind: 'category'}) )

  let items = [...pantheons, ...symbols, ...kinds, ...categories]
  
  items = items.sort( (a, b) =>  {

    let aname = a[`${a.recordKind}_name`] 
    let bname = b[`${b.recordKind}_name`]
    let res = sortdir === "ASC" ? aname.localeCompare(bname) : bname.localeCompare(aname) 
    return res
  
  })

  console.log(items)

  // get page from query params or default to first page
  const page = parseInt(req.query.page) || 1;

  // get pager object for specified page
  const pageSize = 30;
  const pager = paginate(items.length, page, pageSize);

  // get page of items from items array
  const pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);

  // return pager object and current page of items
  return res.json({
    pager, pageOfItems: pageOfItems.map(
      item => ({
        name: item[`${item.recordKind}_name`],
        recordKind: item.recordKind, 
        id: item[`${item.recordKind}_id`],
        description: item[`${item.recordKind}_description`],
        thumbnail: {
          image_url: item.image_url,
          thumbnail: item.thumbnail,
          image_title: item.image_title,
          image_description: item.image_description,
          image_id: item.image_id
        }
      }))
    })      
});

router.get('/random', async(req, res) => {
  let items = []

  const pantheons = await Pantheons.find('pantheon_name', 'asc', '').map(i => ({...i, recordKind: 'pantheon'}) )

  for(var i = 0; i < 4; i++){
    let pos = Math.floor(Math.random() * pantheons.length)
    items.push(pantheons[pos])
    pantheons.splice(pos, 1)
  }

  const symbols = await Symbols.find('symbol_name', 'asc', '').map(i => ({...i, recordKind: 'symbol'}) )

  for(var i = 0; i < 4; i++){
    let pos = Math.floor(Math.random() * symbols.length)
    items.push(symbols[pos])
    symbols.splice(pos, 1)
  }

  const kinds = await Kinds.find('kind_name', 'asc', '').map(i => ({...i, recordKind: 'kind'}) )

  for(var i = 0; i < 4; i++){
    let pos = Math.floor(Math.random() * kinds.length)
    items.push(kinds[pos])
    kinds.splice(pos, 1)
  }

  const categories = await Categories.find('category_name', 'asc', '').map(i => ({...i, recordKind: 'category'}) )

  for(var i = 0; i < 4; i++){
    let pos = Math.floor(Math.random() * categories.length)
    items.push(categories[pos])
    categories.splice(pos, 1)
  }
  
  items = items.sort( (a, b) =>  {

    let aname = a[`${a.recordKind}_name`] 
    let bname = b[`${b.recordKind}_name`]
    return aname.localeCompare(bname) 
  
  })
  console.log(items)


  // return pager object and current page of items
  return res.json({
    items: items.map(
      item => ({
        name: item[`${item.recordKind}_name`],
        recordKind: item.recordKind, 
        id: item[`${item.recordKind}_id`],
        description: item[`${item.recordKind}_description`],
        thumbnail: {
          image_url: item.image_url,
          thumbnail: item.thumbnail,
          image_title: item.image_title,
          image_description: item.image_description,
          image_id: item.image_id
        }
      }))
    })      
  







})






module.exports = router;
