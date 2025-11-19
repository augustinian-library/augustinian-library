const express = require("express");
const router = express.Router();
const db = require("../sqlite");

// Reserve a book
router.post("/reserve", (req, res) => {
    const { reg, barcode } = req.body;

    // 1. Check if book exists
    db.get(`SELECT * FROM books WHERE barcode = ?`, [barcode], (err, book) => {
        if (!book) return res.status(404).json({ error: "Book not found" });

        // 2. If any copy is available → reservation not allowed
        if (book.available > 0) {
            return res.json({
                error: "Reservation not allowed. Book is available on shelf.",
            });
        }

        // 3. Check current reservations
        db.all(
            `SELECT * FROM reservations WHERE barcode = ? ORDER BY id ASC`,
            [barcode],
            (err, reservations) => {
                if (reservations.length >= book.copies) {
                    return res.json({
                        error:
                            "Reservation full. Maximum allowed = number of copies.",
                    });
                }

                // 4. Find earliest due date among issued copies
                db.get(
                    `
                    SELECT MIN(dueDate) AS earliestDue 
                    FROM loans 
                    WHERE barcode = ? AND returned = 0
                    `,
                    [barcode],
                    (err, row) => {
                        const earliestDue = row.earliestDue;

                        // Add 15 days to earliest due date
                        const reserveAvailableDate = new Date(
                            new Date(earliestDue).getTime() +
                                15 * 24 * 60 * 60 * 1000
                        )
                            .toISOString()
                            .split("T")[0];

                        // 5. Store reservation in database
                        db.run(
                            `
                            INSERT INTO reservations (reg, barcode, availableDate)
                            VALUES (?, ?, ?)
                            `,
                            [reg, barcode, reserveAvailableDate],
                            (err2) => {
                                if (err2)
                                    return res
                                        .status(500)
                                        .json({ error: err2.message });

                                res.json({
                                    success: true,
                                    availableDate: reserveAvailableDate,
                                    message: `Reservation successful. Book will be available on ${reserveAvailableDate}`,
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

// List all reservations
router.get("/list", (req, res) => {
    db.all(`SELECT * FROM reservations ORDER BY availableDate ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Delete a reservation (when collected or cancelled)
router.delete("/cancel/:id", (req, res) => {
    db.run(`DELETE FROM reservations WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes === 1 });
    });
});

module.exports = router;
