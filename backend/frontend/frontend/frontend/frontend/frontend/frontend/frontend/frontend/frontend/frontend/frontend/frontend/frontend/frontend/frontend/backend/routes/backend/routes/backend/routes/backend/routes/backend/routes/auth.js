const express = require("express");
const router = express.Router();
const db = require("../sqlite");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SECRET KEY for JWT
const SECRET = "library_system_secret_key";

// -------------------------
// Librarian Login
// -------------------------
router.post("/login/admin", async (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT * FROM admin WHERE username = ?`,
        [username],
        async (err, admin) => {
            if (err || !admin)
                return res
                    .status(400)
                    .json({ error: "Invalid username or password" });

            const match = await bcrypt.compare(password, admin.password);

            if (!match)
                return res
                    .status(400)
                    .json({ error: "Invalid username or password" });

            const token = jwt.sign(
                { role: "admin", username: admin.username },
                SECRET,
                { expiresIn: "7d" }
            );

            res.json({ token });
        }
    );
});

// -------------------------
// Student Login
// -------------------------
router.post("/login/student", async (req, res) => {
    const { reg, password } = req.body;

    db.get(
        `SELECT * FROM students WHERE reg = ?`,
        [reg],
        async (err, student) => {
            if (err || !student)
                return res
                    .status(400)
                    .json({ error: "Invalid registration or password" });

            const match = await bcrypt.compare(password, student.password);

            if (!match)
                return res
                    .status(400)
                    .json({ error: "Invalid registration or password" });

            const token = jwt.sign(
                { role: "student", reg: student.reg },
                SECRET,
                { expiresIn: "7d" }
            );

            res.json({ token });
        }
    );
});

// Export router
module.exports = router;
