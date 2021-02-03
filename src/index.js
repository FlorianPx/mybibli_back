require("dotenv");
const express = require("express");
const connection = require("./config");

const port = 3008;
const app = express();

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
        console.log(err);
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
        console.log(err);
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
    "SELECT * FROM book JOIN user_book ON user_book.book_id=book.id JOIN user ON user.id=user_book.user_id WHERE user.id=? AND wishlist=0",
    [id_user],
    (err, results) => {
      if (err) {
        console.log(err);
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
    "SELECT * FROM book JOIN user_book ON user_book.book_id=book.id JOIN user ON user.id=user_book.user_id WHERE user.id=? AND wishlist=1",
    [id_user],
    (err, results) => {
      if (err) {
        console.log(err);
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
        console.log(err);
        res.status(500).send("Error updating user");
      } else {
        res.status(200).send("User updated successfully 🎉");
      }
    }
  );
});

app.post("/api/users", (req, res) => {
  const { name, email, password } = req.body;
  connection.query(
    "INSERT INTO user (name, email, password ) VALUES (?,?,?)",
    [name, email, password],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error saving user");
      } else {
        res.status(200).send("User successfully saved");
      }
    }
  );
});

app.delete("/api/users/:id", (req, res) => {
  const id_user = req.params.id;
  connection.query(
    "DELETE FROM user WHERE id = ?",
    [id_user],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("😱 Error deleting an user");
      } else {
        res.status(200).send("🎉 User deleted!");
      }
    }
  );
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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
        res.status(500).send("Error saving book");
      } else {
        res.status(200).send("Book successfully saved");
      }
    }
  );
});

app.delete("/api/books/:id", (req, res) => {
  const id_playlist = req.params.id;
  connection.query(
    "DELETE FROM book WHERE id = ?",
    [id_playlist],
    (err, results) => {
      if (err) {
        console.log(err);
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
