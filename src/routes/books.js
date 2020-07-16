import express from 'express';
import request from 'request-promise';
import { parseString } from 'xml2js';
import authenticate from '../middlewares/authenticate';
import Book from '../models/Book';
import parseErrors from '../utils/parseErrors';

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  Book.find({ userId: req.currentUser._id }).then((books) =>
    res.json({ books })
  );
});

router.post('/', (req, res) => {
  Book.create({ ...req.body.book, userId: req.currentUser._id })
    .then((book) => res.json({ book }))
    .catch((err) => res.status(400).json({ errors: parseErrors(err.errors) }));
});

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

router.get('/fetchPages', (req, res) => {
  const goodreadsId = req.query.goodreadsId;

  request
    .get(
      `https://www.goodreads.com/book/show.xml?key=Y3PwKpWcAM60BtLXk2k24A&id=${goodreadsId}`
    )
    .then((result) =>
      parseString(result, (err, goodreadsResult) => {
        const numPages = goodreadsResult.GoodreadsResponse.book[0].num_pages[0];
        const pages = numPages ? parseInt(numPages, 10) : 0;
        res.json({
          pages,
        });
      })
    );
});

/*
  res.json({
    books: [
      {

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
