const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

// Create database file
const db = new sqlite3.Database("./library.db");

// Initialize all tables
db.serialize(() => {
    // -------------------------
    // Admin (Librarian) Table
    // -------------------------
    db.run(
        `
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `,
        (err) => {
            if (!err) {
                // Create default librarian only once
                db.get(`SELECT * FROM admin WHERE username = ?`, ["librarian"], async (err, row) => {
                    if (!row) {
                        const hashed = await bcrypt.hash("Librarian@2004", 10);
                        db.run(
                            `INSERT INTO admin (username, password) VALUES (?, ?)`,
                            ["librarian", hashed]
                        );
                    }
                });
            }
        }
    );

    // -------------------------
    // Students Table
    // -------------------------
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            reg TEXT UNIQUE,
            email TEXT,
            phone TEXT,
            password TEXT
        )
    `);

    // -------------------------
    // Books Table
    // -------------------------
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            barcode TEXT UNIQUE,
            category TEXT,
            shelf TEXT,
            copies INTEGER,
            available INTEGER
        )
    `);

    // -------------------------
    // Loan Records
    // -------------------------
    db.run(`
        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reg TEXT,
            barcode TEXT,
            checkoutDate TEXT,
            dueDate TEXT,
            returned INTEGER DEFAULT 0,
            returnDate TEXT,
            fine INTEGER DEFAULT 0
        )
    `);

    // -------------------------
    // Reservation Table
    // -------------------------
    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reg TEXT,
            barcode TEXT,
            availableDate TEXT
        )
    `);
});

module.exports = db;
