require("dotenv");
const express = require("express");
const connection = require("./config");
const cors = require("cors");
const verifyToken = require("./usersControllers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const port = 3008;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/allelements", (req, res) => {
  connection.query(
    "SELECT * FROM user_book JOIN user ON user.id=user_book.user_id JOIN book ON book.id=user_book.book_id",
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

//___________________USERS___________________________________
app.get("/api/users", (req, res) => {
  connection.query("SELECT * FROM user ORDER BY user.name", (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      res.json(results);
    }
  });
});

app.get("/api/users/:id", (req, res) => {
  connection.query(
    "SELECT * FROM user WHERE id=?",
    [req.params.id],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data").json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.get("/api/users/:id/books", (req, res) => {
  const id_user = req.params.id;
  connection.query(
    "SELECT book.id, book.title, book.author, book.img, user_book.favorite, user_book.wishlist, user_book.id AS userBook_id FROM user_book JOIN book ON book.id=user_book.book_id JOIN user ON user.id=user_book.user_id WHERE user.id=? ORDER BY book.title ASC",
    [id_user],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.get("/api/users/:id/books/mybooks", (req, res) => {
  const id_user = req.params.id;
  connection.query(
    "SELECT book.id, book.title, book.author, book.img, user_book.favorite, user_book.wishlist, user_book.id AS userBook_id FROM user_book JOIN book ON book.id=user_book.book_id JOIN user ON user.id=user_book.user_id WHERE user_book.wishlist='false' AND user.id=? ORDER BY book.title ASC",
    [id_user],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.get("/api/users/:id/books/mywishlist", (req, res) => {
  const id_user = req.params.id;
  connection.query(
    "SELECT book.id, book.title, book.author, book.img, user_book.favorite, user_book.wishlist, user_book.id AS userBook_id FROM user_book JOIN book ON book.id=user_book.book_id JOIN user ON user.id=user_book.user_id WHERE user_book.wishlist='true' AND user.id=? ORDER BY book.title ASC",
    [id_user],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data");
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.put("/api/users/:id", (req, res) => {
  const id_user = req.params.id;
  const new_user = req.body;
  connection.query(
    "UPDATE user SET ? WHERE user.id = ?",
    [new_user, id_user],
    (err) => {
      if (err) {
        res.status(500).send("Error updating user");
      } else {
        res.status(200).send("User updated successfully 🎉");
      }
    }
  );
});

app.put("/api/users/:id/books/:id", (req, res) => {
  const user_id = req.params.id;
  const book_id = req.params.id;
  const new_book = req.body;
  connection.query(
    "UPDATE book SET book.id, book.title, book.author, book.img WHERE user_id=? AND book_id=?",
    [new_book, user_id, book_id],
    (err) => {
      if (err) {
        res.status(500).send("Error updating book");
      } else {
        res.status(200).send("Book updated successfully 🎉");
      }
    }
  );
  connection.query(
    "UPDATE user_book SET user_book.favorite, user_book.wishlist WHERE user_id=? AND book_id=?",
    [new_book, user_id, book_id],
    (err) => {
      if (err) {
        res.status(500).send("Error updating user book");
      } else {
        res.status(200).send("User book updated successfully 🎉");
      }
    }
  );
});

app.put("/api/users/:id/books/:id/mywishlist", (req, res) => {
  const user_id = req.params.id;
  const book_id = req.params.id;
  const new_book = req.body;
  connection.query(
    "UPDATE user_book SET ? WHERE user_id=? AND book_id=?",
    [new_book, user_id, book_id],
    (err) => {
      if (err) {
        res.status(500).send("Error updating user book");
      } else {
        res.status(200).send("User book updated successfully 🎉");
      }
    }
  );
});

app.put("/api/books/:id/favorite", (req, res) => {
  const id = req.params.id;
  const new_book = req.body;
  connection.query(
    "UPDATE user_book SET ? WHERE id=?",
    [new_book, id],
    (err) => {
      if (err) {
        res.status(500).send("Error updating book");
      } else {
        res.status(200).send("Book updated successfully 🎉");
      }
    }
  );
});

app.post("/api/users", (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  const dataUser = {
    name: req.body.name,
    email: req.body.email,
    password: hash,
    src: req.body.src,
    image_id: req.body.image_id,
  };
  connection.query("INSERT INTO user SET ?", [dataUser], (err, results) => {
    if (err) {
      res.status(500).send("Error saving user");
    } else {
      res.status(200).send("User successfully saved");
    }
  });
});

app.post("/api/users/:id/books/", (req, res) => {
  const user_id = req.params.id;
  const { book_id, favorite, wishlist } = req.body;
  connection.query(
    "INSERT INTO user_book (user_id, book_id, favorite, wishlist) VALUES (?,?,?,?)",
    [user_id, book_id, favorite, wishlist],
    (err, results) => {
      if (err) {
        res.status(500).send("Error saving book");
      } else {
        res.status(200).send(results);
      }
    }
  );
});

app.delete("/api/users/:id", (req, res) => {
  const id_user = req.params.id;
  connection.query("DELETE FROM user WHERE id = ?", [id_user], (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("🎉 User deleted!");
    }
  });
});

app.delete(
  "/api/users/:id/books/:bookid/mywishlist",
  verifyToken,
  (req, res) => {
    const user_id = req.params.id;
    const book_id = req.params.bookid;
    connection.query(
      "DELETE FROM user_book WHERE user_id = ? AND book_id = ? ",
      [user_id, book_id],
      (err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send("🎉 Book of user deleted!");
        }
      }
    );
  }
);

app.delete("/api/users/books/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  connection.query("DELETE FROM user_book WHERE id = ? ", [id], (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("🎉 Book of user deleted!");
    }
  });
});

//___________________USER_ACCESS____________________________

app.post("/api/login", (req, res) => {
  connection.query(
    "SELECT *  FROM user WHERE email = ?",
    [req.body.email],
    (err, results) => {
      if (err || results.length === 0) {
        res.status(401).send("Identifiants incorrects");
      } else {
        const goodPassword = bcrypt.compareSync(
          req.body.password,
          results[0].password
        );
        const formData = {
          id: results[0].id,
          name: results[0].name,
          email: results[0].email,
          src: results[0].src,
          image_id: results[0].image_id,
        };

        if (goodPassword) {
          jwt.sign({ formData }, process.env.SECRET_KEY, (error, token) => {
            if (error) {
              res.sendStatus(401);
            } else {
              res.json({
                token,
                id: formData.id,
                name: formData.name,
                iconId: formData.image_id,
              });
            }
          });
        } else {
          res.status(401).send("Identifiants incorrects");
        }
      }
    }
  );
});

app.post("/api/profile", verifyToken, (req, res) => {
  res.send(req.results);
});

//__________________BOOKS_________________________________

app.get("/api/books", (req, res) => {
  connection.query(
    "SELECT * FROM book ORDER BY book.title ASC",
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

app.get("/api/books/:id", (req, res) => {
  connection.query(
    "SELECT * FROM book WHERE id=?",
    [req.params.id],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving data").json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.post("/api/books", (req, res) => {
  const { title, author, img } = req.body;
  connection.query(
    "INSERT INTO book (title, author, img) VALUES (?,?,?)",
    [title, author, img],
    (err, results) => {
      if (err) {
        res.status(500).send("Error saving book");
      } else {
        res.status(200).send(results);
      }
    }
  );
});

app.delete("/api/books", verifyToken, (req, res) => {
  const book_id = req.params.id;
  connection.query("DELETE FROM book WHERE id=?", [book_id], (err) => {
    if (err) {
      res.status(500).send("😱 Error deleting an book");
    } else {
      res.status(200).send("🎉 Book deleted!");
    }
  });
});

app.delete("/api/books/:id", verifyToken, (req, res) => {
  const userBook_id = req.params.id;
  connection.query("DELETE FROM user_book WHERE id=?", [userBook_id], (err) => {
    if (err) {
      res.status(500).send("😱 Error deleting an book");
    } else {
      res.status(200).send("🎉 Book deleted!");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is runing on ${port}`);
});
