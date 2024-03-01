const express = require('express');
const app = express();
const cors = require('cors')
const stripe = require("stripe")('sk_test_51Oo9WeF0pVWnqvzbbw90Ybsz0Dkulq8VYH5dERDV2O9QTt1WaOWT9BDtzRWvDX37t4O2TYFWAgW2goj2Ai6IlDA70032uaOL9z');
const db = require('./db')

app.use(cors())
app.use(express.json());

// Rota para receber pagamentos
app.post('/criar-pagamento', async (req, res) => {
  const { valor, moeda, fonte } = req.body;

  try {
    const pagamento = await stripe.charges.create({
      amount: valor,
      currency: moeda,
      source: fonte // token de pagamento ou ID do cliente
    });

    res.json({ pagamento });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para criar um novo produto
app.post('/create-product', (req, res) => {
  const { name, price, previousprice, description, tags, image } = req.body;

  db.run(`INSERT INTO products (name, price, previousprice, description, tags, image) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, price, previousprice, description, tags, image],
    function (err) {

      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
});

// Rota para retornas os produto existente
app.get('/products', (req, res) => {
  db.all(`SELECT * FROM products`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// Rota para deletar um produto por ID
app.delete('/delete-product/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM products WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    // Verifica se algum registro foi afetado
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto deletado com sucesso' });
  });
});

// Rota para atualizar um produto existente
app.put('/products/:id', (req, res) => {
  const id = req.params.id;
  const { name, price, previousprice, description, tags, image } = req.body;

  // Construa a consulta SQL para atualizar os dados
  let sql = `UPDATE products SET `;
  let params = [];

  // Adicione apenas os campos que foram recebidos na requisição
  if (name !== undefined) {
    sql += `name = ?, `;
    params.push(name);
  }
  if (price !== undefined) {
    sql += `price = ?, `;
    params.push(price);
  }
  if (previousprice !== undefined) {
    sql += `previousprice = ?, `;
    params.push(previousprice);
  }
  if (description !== undefined) {
    sql += `description = ?, `;
    params.push(description);
  }
  if (tags !== undefined) {
    sql += `tags = ?, `;
    params.push(tags);
  }
  if (image !== undefined) {
    sql += `image = ?, `;
    params.push(image);
  }

  // Remova a vírgula extra no final da consulta SQL
  sql = sql.slice(0, -2);

  // Adicione a cláusula WHERE para atualizar apenas a linha com o id fornecido
  sql += ` WHERE id = ?`;
  params.push(id);

  // Execute a consulta SQL
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Dados da tabela products atualizados com sucesso.' });
  });
});

// Rota para buscar um produto por ID
app.get('/products/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM products WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(row);
  });
});

// Rota para retornar todos os reviews
app.get('/reviews', (req, res) => {
  db.all("SELECT * FROM reviews", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Rota para criar um novo review
app.post('/reviews', (req, res) => {
  const { name, review, city, date, image } = req.body;
  console.log({ name, review, city, date, image })
  if (!name || !review || !city) {
    res.status(400).json({ error: "Por favor, forneça nome, review e cidade." });
    return;
  }
  db.run("INSERT INTO reviews (name, review, city, date, image) VALUES (?, ?, ?, ?, ?)", [name, review, city, date, image], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      name: name,
      review: review,
      city: city,
      date: date,
      image: image
    });
  });
});

// Rota para atualizar um review
app.put('/reviews/:id', (req, res) => {
  const id = req.params.id;
  const { name, city, date, review, image } = req.body;

  // Construa a consulta SQL dinamicamente
  let sql = 'UPDATE reviews SET ';
  let params = [];

  if (name !== "") {
    sql += 'name = ?, ';
    params.push(name);
  }
  if (city !== "") {
    sql += 'city = ?, ';
    params.push(city);
  }
  if (date !== "") {
    sql += 'date = ?, ';
    params.push(date);
  }
  if (review !== "") {
    sql += 'review = ?, ';
    params.push(review);
  }
  if (image !== "") {
    sql += 'image = ?, ';
    params.push(image);
  }

  // Remova a vírgula extra no final da consulta SQL
  sql = sql.slice(0, -2);

  // Adicione a cláusula WHERE para atualizar apenas o registro com o id fornecido
  sql += ' WHERE id = ?';
  params.push(id);

  // Execute a consulta SQL no banco de dados
  db.run(sql, params, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Dados atualizados com sucesso.' });
  });
});

// Rota para deletar um review com base no ID
app.delete('/reviews/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM reviews WHERE id = ?", id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Review deletado com sucesso." });
  });
});

// Rota para atualizar os dados do site
app.put('/adminsettings', (req, res) => {
  const id = 1;
  const { sitename, sitecolor, homebanner, homefeatureproduct, homecollections } = req.body;

  // Construa a consulta SQL para atualizar os dados
  let sql = `UPDATE adminsettings SET `;
  let params = [];

  if (sitename) {
    sql += `sitename = ?, `;
    params.push(sitename);
  }
  if (sitecolor) {
    sql += `sitecolor = ?, `;
    params.push(sitecolor);
  }
  if (homebanner) {
    sql += `homebanner = ?, `;
    params.push(homebanner);
  }
  if (homefeatureproduct) {
    sql += `homefeatureproduct = ?, `;
    params.push(homefeatureproduct);
  }
  if (homecollections) {
    sql += `homecollections = ?, `;
    params.push(homecollections);
  }

  // Remove a vírgula extra no final da consulta SQL
  sql = sql.slice(0, -2);

  // Adicione a cláusula WHERE para atualizar apenas a linha com o id fornecido
  sql += ` WHERE id = ?`;
  params.push(id);

  // Execute a consulta SQL
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Dados da tabela adminsettings atualizados com sucesso.' });
  });
});

// Rota para retornar todas as configurações do site
app.get('/adminsettings', (req, res) => {
  db.all("SELECT * FROM adminsettings", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// PAGAMENTOS

const calculateOrderAmount = (items) => {
  console.log(items)
  return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "brl",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`API do Stripe rodando na porta ${PORT}!`);
});
