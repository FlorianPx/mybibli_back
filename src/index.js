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
  connection.query("SELECT * FROM user", (err, results) => {
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
    "SELECT * FROM book JOIN user_book ON user_book.book_id=book.id JOIN user ON user.id=user_book.user_id WHERE user.id=?",
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
    "SELECT * FROM book JOIN user_book ON user_book.book_id=book.id JOIN user ON user.id=user_book.user_id WHERE book.wishlist='false' AND user.id=?",
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
    "SELECT * FROM book JOIN user_book ON user_book.book_id=book.id JOIN user ON user.id=user_book.user_id WHERE book.wishlist='true' AND user.id=?",
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
    (err, results) => {
      if (err) {
        res.status(500).send("Error updating user");
      } else {
        res.status(200).send("User updated successfully 🎉");
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

app.delete("/api/users/:id", (req, res) => {
  const id_user = req.params.id;
  connection.query(
    "DELETE FROM user WHERE id = ?",
    [id_user],
    (err, results) => {
      if (err) {
        res.status(500).send("😱 Error deleting an user");
      } else {
        res.status(200).send("🎉 User deleted!");
      }
    }
  );
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
              res.json({ token, id: formData.id });
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
  connection.query("SELECT * FROM book", (err, results) => {
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

app.put("/api/books/:id", (req, res) => {
  const id_book = req.params.id;
  const new_book = req.body;
  connection.query(
    "UPDATE book SET ? WHERE book.id = ?",
    [new_book, id_book],
    (err, results) => {
      if (err) {
        res.status(500).send("Error updating book");
      } else {
        res.status(200).send("Book updated successfully 🎉");
      }
    }
  );
});

app.put("/api/users/:id/books/:id", (req, res) => {
  const id_user = req.params.id;
  const id_book = req.params.id;
  const new_book = req.body;
  connection.query(
    "UPDATE book SET ? WHERE book.id = ?",
    [id_user, id_book, new_book],
    (err, results) => {
      if (err) {
        res.status(500).send("Error updating book");
      } else {
        res.status(200).send("Book updated successfully 🎉");
      }
    }
  );
});

app.post("/api/books", (req, res) => {
  const { title, type, author, favorite, img, wishlist } = req.body;
  connection.query(
    "INSERT INTO book (title, type, author, favorite, img, wishlist) VALUES (?,?,?,?,?,?)",
    [title, type, author, favorite, img, wishlist],
    (err, results) => {
      if (err) {
        res.status(500).send("Error saving book");
      } else {
        res.status(200).send(results);
      }
    }
  );
});

app.post("/api/users/:id/books", (req, res) => {
  const id_user = req.params.id;
  const { book_id, user_id } = req.body;
  connection.query(
    "INSERT INTO user_book (book_id, user_id) VALUES (?,?)",
    [book_id, user_id, id_user],
    (err, results) => {
      if (err) {
        res.status(500).send("Error saving book");
      } else {
        res.status(200).send(results);
      }
    }
  );
});

app.delete("/api/books/:id", verifyToken, (req, res) => {
  const book_id = req.params.id;
  connection.query(
    "DELETE FROM book WHERE id = ?",
    [book_id],
    (err, results) => {
      if (err) {
        res.status(500).send("😱 Error deleting an book");
      } else {
        res.status(200).send("🎉 Book deleted!");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is runing on ${port}`);
});
