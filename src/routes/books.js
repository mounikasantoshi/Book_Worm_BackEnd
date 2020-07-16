import express from 'express';
import request from 'request-promise';
import { parseString } from 'xml2js';
import authenticate from '../middlewares/authenticate';

const router = express.Router();
router.use(authenticate);

router.get('/search', (req, res) => {
  request
    .get(
      `https://www.goodreads.com/search/index.xml?key=Y3PwKpWcAM60BtLXk2k24A&q=${req.query.q}`
    )
    .then((result) =>
      parseString(result, (err, goodreadsResult) =>
        res.json({
          books: goodreadsResult.GoodreadsResponse.search[0].results[0].work.map(
            (work) => ({
              goodreadsId: work.best_book[0].id[0]._,
              title: work.best_book[0].title[0],
              authors: work.best_book[0].author[0].name[0],
              covers: [work.best_book[0].image_url[0]],
            })
          ),
        })
      )
    );
});
/*
  res.json({
    books: [
      {
        goodreadsId: 1,
        title: '1984',
        authors: 'Orwell',
        covers: [
          'https://img.jakpost.net/c/2019/03/02/2019_03_02_66706_1551461528._large.jpg',
          'https://media.gettyimages.com/photos/stack-of-books-picture-id157482029?s=612x612',
        ],
        pages: 198,
      },
      {
        goodreadsId: 2,
        title: 'Three men',
        authors: 'Jerome k.Jerome',
        covers: [
          'https://media.gettyimages.com/photos/stack-of-books-picture-id157482029?s=612x612',
          'https://img.jakpost.net/c/2019/03/02/2019_03_02_66706_1551461528._large.jpg',
        ],
        pages: 120,
      },
    ],
  });
});
*/

export default router;
