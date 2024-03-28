// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const validator = require('validator');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());

// Use cors middleware
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database('submit.db');

// Create table to store form data
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS formData (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");
});

// Route to get list of submitted forms
app.get('/api/submittedForms', (req, res) => {
    db.all("SELECT * FROM formData", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve submitted forms" });
        }
        res.json(rows);
    });
});

// Route to handle form data submission
app.post('/api/submitFormData', (req, res) => {
    const { name, email } = req.body;

    // Simple validation
    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email address" });
    }

    // Insert form data into the database
    db.run("INSERT INTO formData (name, email) VALUES (?, ?)", [name, email], function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to store form data" });
        }
        res.json({ message: "Form data stored successfully", id: this.lastID });
    });
});

// Route to update form data
app.put('/api/updateFormData/:id', (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;

    // Simple validation
    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email address" });
    }

    // Update form data in the database
    db.run("UPDATE formData SET name = ?, email = ? WHERE id = ?", [name, email, id], function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to update form data" });
        }
        res.json({ message: "Form data updated successfully" });
    });
});

// Route to delete form data
app.delete('/api/deleteFormData/:id', (req, res) => {
    const id = req.params.id;

    // Delete form data from the database
    db.run("DELETE FROM formData WHERE id = ?", id, function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to delete form data" });
        }
        res.json({ message: "Form data deleted successfully" });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
