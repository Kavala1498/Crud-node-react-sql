// server/index.js
const express = require('express');
const db = require('./db'); // ./db.js
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Health check
app.get('/', (req, res) => res.json({ ok: true }));

// ------------------ PRODUCTOS CRUD ------------------
// GET /productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /productos/:id
app.get('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(results[0]);
  });
});

// POST /productos
app.post('/productos', (req, res) => {
  const { nombre, precio, stock, categoria, descripcion } = req.body;
  if (!nombre || precio == null || stock == null || !categoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio, stock, categoria)' });
  }
  const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, descripcion) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nombre, precio, stock, categoria, descripcion || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, nombre, precio, stock, categoria, descripcion });
  });
});

// PUT /productos/:id
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria, descripcion } = req.body;
  if (!nombre || precio == null || stock == null || !categoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio, stock, categoria)' });
  }
  const sql = 'UPDATE productos SET nombre=?, precio=?, stock=?, categoria=?, descripcion=? WHERE id=?';
  db.query(sql, [nombre, precio, stock, categoria, descripcion || null, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto actualizado' });
  });
});

// DELETE /productos/:id
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto eliminado' });
  });
});

// ------------------ CARRITO (simple, in-memory) ------------------
// Nota: implementación simple para la práctica. En un sistema real el carrito debe persistir por usuario.
const carrito = []; // array de { id, nombre, precio, cantidad }

app.post('/carrito/agregar', (req, res) => {
  const { producto_id } = req.body;
  if (!producto_id) return res.status(400).json({ error: 'producto_id requerido' });

  db.query('SELECT * FROM productos WHERE id = ?', [producto_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Producto no encontrado' });
    const p = results[0];

    // verificar si ya existe en carrito -> sumar cantidad
    const idx = carrito.findIndex(x => x.id === p.id);
    if (idx === -1) {
      carrito.push({ id: p.id, nombre: p.nombre, precio: Number(p.precio), cantidad: 1 });
    } else {
      carrito[idx].cantidad += 1;
    }
    res.json({ message: 'Agregado al carrito', carrito });
  });
});

app.delete('/carrito/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = carrito.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Producto no en carrito' });
  carrito.splice(idx, 1);
  res.json({ message: 'Eliminado del carrito', carrito });
});

app.get('/carrito', (req, res) => {
  const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
  res.json({ carrito, total });
});

// ------------------ ORDENES ------------------
// GET /ordenes
app.get('/ordenes', (req, res) => {
  db.query('SELECT * FROM ordenes ORDER BY fecha DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST /ordenes  (body: { total } )
app.post('/ordenes', (req, res) => {
  const { total } = req.body;
  if (total == null) return res.status(400).json({ error: 'total requerido' });

  // 1) Crear la orden con el total recibido (el total ya fue calculado desde el carrito)
  db.query('INSERT INTO ordenes (total) VALUES (?)', [total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const ordenId = result.insertId;

    // 2) Registrar los productos actuales del carrito en orden_productos
    //    Estructura: (orden_id, producto_id, cantidad)
    const itemsValues = carrito.map(item => [ordenId, item.id, item.cantidad]);

    if (itemsValues.length === 0) {
      // Carrito vacío: responder solo con la orden creada
      return res.json({ id: ordenId, total });
    }

    db.query('INSERT INTO orden_productos (orden_id, producto_id, cantidad) VALUES ?', [itemsValues], (itemsErr) => {
      if (itemsErr) return res.status(500).json({ error: itemsErr.message });

      // 3) Limpiar carrito después de persistir
      carrito.length = 0;
      return res.json({ id: ordenId, total });
    });
  });
});

// ------------------ Start server ------------------
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
