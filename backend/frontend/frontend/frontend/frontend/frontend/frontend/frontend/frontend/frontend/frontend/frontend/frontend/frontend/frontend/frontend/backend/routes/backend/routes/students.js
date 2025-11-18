const express = require("express");
const router = express.Router();
const db = require("../sqlite");

// Add a student
// POST /students/add
// body: { id, name, grade, division, admission_no, contact }
router.post("/add", (req, res) => {
  const { id, name, grade, division, admission_no, contact } = req.body;
  const stmt = db.prepare(`
    INSERT INTO students (id, name, grade, division, admission_no, contact)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  try {
    stmt.run(id, name, grade, division, admission_no, contact || "");
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// List students
// GET /students
router.get("/", (req, res) => {
  db.all(`SELECT * FROM students ORDER BY name LIMIT 2000`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Search students by name or admission_no
// GET /students/search?q=...
router.get("/search", (req, res) => {
  const q = `%${(req.query.q || "").trim()}%`;
  db.all(
    `SELECT * FROM students WHERE name LIKE ? OR admission_no LIKE ? LIMIT 500`,
    [q, q],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Delete student
// DELETE /students/:id
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM students WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes === 1 });
  });
});

module.exports = router;
