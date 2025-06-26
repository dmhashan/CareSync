import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));

// MySQL connection
let db;
(async () => {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        console.log('✅ MySQL connected');
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
    }
})();

// Routes
app.post('/api/prescriptions', async (req, res) => {
    try {
        const { patientId, prescribedBy, prescribedDate, notes, medicines } = req.body;

        const [result] = await db.execute(
            `INSERT INTO prescriptions (patientId, prescribedBy, prescribedDate, notes) VALUES (?, ?, ?, ?)`,
            [patientId, prescribedBy, prescribedDate, notes]
        );

        const prescriptionId = result.insertId;

        for (const med of medicines) {
            await db.execute(
                `INSERT INTO prescription_medicines 
        (prescriptionId, drugName, morningBeforeMeal, morningAfterMeal, noonBeforeMeal, noonAfterMeal, nightBeforeMeal, nightAfterMeal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    prescriptionId,
                    med.drugName,
                    med.morningBeforeMeal || false,
                    med.morningAfterMeal || false,
                    med.noonBeforeMeal || false,
                    med.noonAfterMeal || false,
                    med.nightBeforeMeal || false,
                    med.nightAfterMeal || false
                ]
            );
        }

        res.json({ message: 'Prescription added successfully', prescriptionId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/medicine-chart/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;

        const [rows] = await db.execute(`
      SELECT pm.*
      FROM prescriptions p
      JOIN prescription_medicines pm ON p.id = pm.prescriptionId
      WHERE p.patientId = ?
    `, [patientId]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
