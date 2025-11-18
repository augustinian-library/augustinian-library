const express = require("express");
const router = express.Router();
const db = require("../sqlite");


// ADD BOOK
router.post("/add", (req, res) => {
    const { title, author, category, shelf, copies, barcode } = req.body;

    db.run(
        `INSERT INTO books (title, author, category, shelf, copies, available, barcode)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, author, category, shelf, copies, copies, barcode],
        err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});


// SEARCH BOOKS
router.get("/search", (req, res) => {
    const q = "%" + req.query.q + "%";

    db.all(
        `SELECT * FROM books WHERE title LIKE ? OR author LIKE ?`,
        [q, q],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});


// DELETE BOOK
router.delete("/delete/:barcode", (req, res) => {
    const barcode = req.params.barcode;

    db.run(`DELETE FROM books WHERE barcode=?`, [barcode], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: true });
    });
});


// LIST ALL BOOKS
router.get("/all", (req, res) => {
    db.all(`SELECT * FROM books`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


module.exports = router;
