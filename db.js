const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conexão com o banco de dados SQLite estabelecida com sucesso!');
  }
  db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        previousprice REAL,
        description TEXT,
        tags TEXT,
        image TEXT
      )`)
  db.run(`
      CREATE TABLE IF NOT EXISTS adminsettings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sitename TEXT,
        sitecolor TEXT,
        homebanner TEXT,
        homefeatureproduct TEXT,
        homecollections TEXT
      )`)

  db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        city TEXT,
        date DATE,
        review TEXT,
        image TEXT
      )`)
})

module.exports = db