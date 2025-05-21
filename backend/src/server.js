require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const limit = 10;

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verify database connection
(async () => {
  try {
    await db.getConnection();
    console.log('Connected to MySQL database!');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
})();

// Admin service
const adminService = {
  async registerUser({ firstname, lastname, email, password, roles_id = 1 }) {
    try {
      const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        throw new Error('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, limit);
      const [result] = await db.query(
        'INSERT INTO users (firstname, lastname, email, password, roles_id) VALUES (?, ?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword, roles_id]
      );

      return {
        id: result.insertId,
        firstname,
        lastname,
        email,
        roles_id,
      };
    } catch (err) {
      console.error('Error in registerUser:', err);
      throw err;
    }
  },

async loginUser(email, password) {
  try {
    // Query the database for the user with the given email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('User found')
    console.log('User information :', users);

    // Vérifier si un utilisateur a été trouvé
    // if (users.length === 0) {
    //   console.log('No user found for email:', email);
    //   return null; // Utilisateur non trouvé
    // }

    // Récupérer le premier utilisateur du tableau
    const user = users[0];

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password); 

    if (!isPasswordMatch) {
      console.log('Password does not match for email:', email);
      return null; // Password is incorrect
    }

    console.log('Authentication successful for email:', email);
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
      roles_id: user.roles_id,
    };
  } catch (err) {
    console.error('Error in loginUser:', err.message);
    throw err;
  }
}
};

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password || firstname.trim() === '' || lastname.trim() === '' || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'All fields are required and must not be empty',
      });
    }

    const user = await adminService.registerUser({ firstname, lastname, email, password, roles_id });
    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered',
      });
    }
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with:', { email }, { password: password ? '***' : '' });
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await adminService.loginUser(email, password);
    if (user) {
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          password: user.password,
          role_id: user.roles_id, // Match Angular's LoginResponse interface
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT id, firstname, lastname, email, roles_id FROM users WHERE id = ?', [id]);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ success: false, message: 'Firstname, lastname, and email are required' });
    }

    const updates = { firstname, lastname, email };
    if (password) {
      updates.password = await bcrypt.hash(password, limit);
    }

    const [result] = await db.query(
      'UPDATE users SET firstname = ?, lastname = ?, email = ?' + (password ? ', password = ?' : '') + ' WHERE id = ?',
      password ? [firstname, lastname, email, updates.password, id] : [firstname, lastname, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [updatedUsers] = await db.query('SELECT id, firstname, lastname, email, roles_id FROM users WHERE id = ?', [id]);
    res.json({ success: true, user: updatedUsers[0] });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Categories routes
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, cat_name FROM Categories');
    res.json(rows);
    console.log('Categories fetched successfully:', rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/categories', async (req, res) => {
  const { cat_name } = req.body;
  if (!cat_name) return res.status(400).json({ success: false, message: 'Name is required' });
  try {
    const [result] = await db.query('INSERT INTO categories (cat_name) VALUES (?)', [cat_name]);
    res.json({ id: result.insertId, cat_name });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { cat_name } = req.body;
  if (!cat_name) return res.status(400).json({ success: false, message: 'Name is required' });
  try {
    const [result] = await db.query('UPDATE categories SET cat_name = ? WHERE id = ?', [cat_name, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const [rows] = await db.query('SELECT id, cat_name FROM categories WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Products routes
app.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, pro_name, pro_price, pro_desc, categories_id FROM products');
    res.json(rows);
    console.log('Products fetched successfully:', rows);  
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/products', async (req, res) => {
  const { pro_name, pro_price, pro_desc, categories_id } = req.body;
  if (!pro_name || !pro_price || !pro_desc || !categories_id) {
    return res.status(400).json({ success: false, message: 'Name, price, description, and categories_id are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO products (pro_name, pro_price, pro_desc, categories_id, users_id) VALUES (?, ?, ?, ?, ?)',
      [pro_name, pro_price, pro_desc, categories_id, 53]
    );
    console.log('Product created successfully:', result);
    res.json({ id: result.insertId, pro_name, pro_price, pro_desc, categories_id, users_id: 53 });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { pro_name, pro_price, pro_desc, categories_id } = req.body;
  if (!pro_name || !pro_price || !pro_desc || !categories_id) {
    return res.status(400).json({ success: false, message: 'Name, price, description, and categories_id are required' });
  }
  try {
    const [result] = await db.query(
      'UPDATE products SET pro_name = ?, pro_price = ?, pro_desc = ?, categories_id = ? WHERE id = ?',
      [pro_name, pro_price, pro_desc, categories_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ id: +id, pro_name, pro_price, pro_desc, categories_id });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
});