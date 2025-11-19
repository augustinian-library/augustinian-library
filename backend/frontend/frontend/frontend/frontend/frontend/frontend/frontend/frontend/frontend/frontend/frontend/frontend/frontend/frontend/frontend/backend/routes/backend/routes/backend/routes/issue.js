const express = require("express");
const router = express.Router();
const db = require("../sqlite");

// Helper: calculate date difference
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff;
}

// ISSUE BOOK (Check-out)
router.post("/issue", (req, res) => {
    const { reg, barcode } = req.body;

    const today = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // 1. Check if book exists & has available copies
    db.get(
        `SELECT * FROM books WHERE barcode = ?`,
        [barcode],
        (err, book) => {
            if (!book)
                return res
                    .status(404)
                    .json({ error: "Book not found" });

            if (book.available <= 0)
                return res.json({
                    error: "No copies available",
                });

            // 2. Insert loan record
            db.run(
                `INSERT INTO loans (reg, barcode, issueDate, dueDate, returned)
                 VALUES (?, ?, ?, ?, 0)`,
                [reg, barcode, today, dueDate],
                function (err2) {
                    if (err2)
                        return res
                            .status(500)
                            .json({ error: err2.message });

                    // 3. Decrease available copies
                    db.run(
                        `UPDATE books 
                         SET available = available - 1 
                         WHERE barcode = ?`,
                        [barcode]
                    );

                    res.json({
                        success: true,
                        message: "Book issued",
                    });
                }
            );
        }
    );
});

// RETURN BOOK (Check-in)
router.post("/return", (req, res) => {
    const { reg, barcode } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // 1. Find loan record
    db.get(
        `SELECT * FROM loans WHERE reg = ? AND barcode = ? AND returned = 0`,
        [reg, barcode],
        (err, loan) => {
            if (!loan)
                return res.json({
                    error: "This student does not have this book issued",
                });

            // 2. Calculate fine
            const overdueDays = daysBetween(
                loan.dueDate,
                today
            );
            const fine = overdueDays > 0 ? overdueDays * 1 : 0; // ₹1 per day

            // 3. Update loan record
            db.run(
                `UPDATE loans
                 SET returned = 1, returnDate = ?, fine = ?
                 WHERE id = ?`,
                [today, fine, loan.id]
            );

            // 4. Increase available copies
            db.run(
                `UPDATE books 
                 SET available = available + 1 
                 WHERE barcode = ?`,
                [barcode]
            );

            res.json({
                success: true,
                fine,
                message:
                    fine > 0
                        ? `Book returned with fine: ₹${fine}`
                        : "Book returned successfully",
            });
        }
    );
});

module.exports = router;
