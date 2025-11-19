const express = require("express");
const router = express.Router();
const db = require("../sqlite");

// Get dashboard summary
router.get("/all", async (req, res) => {
    try {
        const summary = {};

        // Total students
        await new Promise((resolve) => {
            db.get(`SELECT COUNT(*) AS count FROM students`, (err, row) => {
                summary.totalStudents = row.count;
                resolve();
            });
        });

        // Total books & copies
        await new Promise((resolve) => {
            db.get(
                `SELECT COUNT(*) AS totalTitles, SUM(copies) AS totalCopies FROM books`,
                (err, row) => {
                    summary.totalTitles = row.totalTitles;
                    summary.totalCopies = row.totalCopies;
                    resolve();
                }
            );
        });

        // Books issued today
        const today = new Date().toISOString().split("T")[0];
        await new Promise((resolve) => {
            db.get(
                `SELECT COUNT(*) AS issuedToday FROM loans 
                 WHERE issueDate = ? AND returned = 0`,
                [today],
                (err, row) => {
                    summary.issuedToday = row.issuedToday;
                    resolve();
                }
            );
        });

        // Due today
        await new Promise((resolve) => {
            db.get(
                `SELECT COUNT(*) AS dueToday FROM loans 
                 WHERE dueDate = ? AND returned = 0`,
                [today],
                (err, row) => {
                    summary.dueToday = row.dueToday;
                    resolve();
                }
            );
        });

        // Overdue count
        await new Promise((resolve) => {
            db.get(
                `SELECT COUNT(*) AS overdue FROM loans 
                 WHERE dueDate < ? AND returned = 0`,
                [today],
                (err, row) => {
                    summary.overdue = row.overdue;
                    resolve();
                }
            );
        });

        // Total fine collected
        await new Promise((resolve) => {
            db.get(`SELECT SUM(amount) AS totalFine FROM fines`, (err, row) => {
                summary.totalFine = row.totalFine || 0;
                resolve();
            });
        });

        // Top 5 most issued books
        await new Promise((resolve) => {
            db.all(
                `SELECT books.title, books.barcode, COUNT(loans.id) AS issueCount
                 FROM loans 
                 JOIN books ON loans.barcode = books.barcode
                 GROUP BY loans.barcode
                 ORDER BY issueCount DESC
                 LIMIT 5`,
                (err, rows) => {
                    summary.topBooks = rows;
                    resolve();
                }
            );
        });

        // Weekly check-ins (last 7 days)
        await new Promise((resolve) => {
            db.all(
                `
                SELECT returnDate, COUNT(*) AS count 
                FROM loans 
                WHERE returned = 1 
                AND returnDate >= DATE('now', '-7 day')
                GROUP BY returnDate
                `,
                (err, rows) => {
                    summary.weeklyReturns = rows;
                    resolve();
                }
            );
        });

        // Top student (most borrowed books)
        await new Promise((resolve) => {
            db.get(
                `
                SELECT students.name, students.reg, COUNT(loans.id) AS totalBorrowed 
                FROM loans
                JOIN students ON loans.reg = students.reg
                GROUP BY loans.reg
                ORDER BY totalBorrowed DESC
                LIMIT 1
                `,
                (err, row) => {
                    summary.topReader = row || null;
                    resolve();
                }
            );
        });

        // Reservations count
        await new Promise((resolve) => {
            db.get(
                `SELECT COUNT(*) AS totalReservations FROM reservations`,
                (err, row) => {
                    summary.totalReservations = row.totalReservations;
                    resolve();
                }
            );
        });

        res.json(summary);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
