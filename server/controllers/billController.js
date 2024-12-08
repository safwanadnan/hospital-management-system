const oracledb = require('oracledb');
const dbConfig = require('../config/database');

const billController = {
    getBillDetails: async (req, res) => {
        let connection;
        try {
            const { patientId } = req.params;
            connection = await oracledb.getConnection(dbConfig);

            // 1. Get patient basic details
            const patientQuery = `
                SELECT 
                    p.pid,
                    p.fname || ' ' || NVL(p.lname, '') as full_name,
                    p.gender,
                    p.hno || ' ' || p.street || ', ' || p.city || ', ' || p.state as address
                FROM patient p
                WHERE p.pid = :pid
            `;

            const patientResult = await connection.execute(
                patientQuery,
                { pid: patientId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (patientResult.rows.length === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            // 2. Get unbilled medicines
            const medicineQuery = `
                SELECT 
                    m.mname,
                    hm.qty,
                    m.mcost as unit_cost,
                    hm.med_date,
                    (hm.qty * m.mcost) as total_cost
                FROM had_medicine hm
                JOIN medicine m ON hm.mid = m.mid
                WHERE hm.pid = :pid
                AND NOT EXISTS (
                    SELECT 1 
                    FROM bill b 
                    WHERE b.pid = hm.pid 
                    AND b.billdate >= hm.med_date
                )
                ORDER BY hm.med_date
            `;

            const medicineResult = await connection.execute(
                medicineQuery,
                { pid: patientId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // 3. Get unbilled tests
            const testQuery = `
                SELECT 
                    t.tname,
                    t.tcost as cost,
                    ht.testdate
                FROM had_test ht
                JOIN test t ON ht.tid = t.tid
                WHERE ht.pid = :pid
                AND NOT EXISTS (
                    SELECT 1 
                    FROM bill b 
                    WHERE b.pid = ht.pid 
                    AND b.billdate >= ht.testdate
                )
                ORDER BY ht.testdate
            `;

            const testResult = await connection.execute(
                testQuery,
                { pid: patientId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // 4. Get room charges (if admitted)
            const roomQuery = `
                SELECT 
                    r.roomtype,
                    rc.rcost as daily_cost,
                    ip.arrival_date,
                    CASE 
                        WHEN ip.discharge_date IS NULL THEN 
                            CEIL(SYSDATE - ip.arrival_date)
                        ELSE 
                            CEIL(ip.discharge_date - ip.arrival_date)
                    END as days_stayed
                FROM in_patient ip
                JOIN room r ON ip.rid = r.rid
                JOIN room_cost rc ON r.roomtype = rc.roomtype
                WHERE ip.pid = :pid
                AND NOT EXISTS (
                    SELECT 1 
                    FROM bill b 
                    WHERE b.pid = ip.pid 
                    AND b.billdate >= ip.arrival_date
                )
            `;

            const roomResult = await connection.execute(
                roomQuery,
                { pid: patientId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // 5. Get current/latest diagnosis
            const diagnosisQuery = `
                SELECT disease
                FROM (
                    SELECT disease, arrival_date
                    FROM in_patient
                    WHERE pid = :pid
                    UNION ALL
                    SELECT disease, arrival_date
                    FROM out_patient
                    WHERE pid = :pid
                    ORDER BY arrival_date DESC
                )
                WHERE ROWNUM = 1
            `;

            const diagnosisResult = await connection.execute(
                diagnosisQuery,
                { pid: patientId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // Calculate totals
            const medicineCost = medicineResult.rows.reduce((sum, med) => sum + med.TOTAL_COST, 0);
            const testCost = testResult.rows.reduce((sum, test) => sum + test.COST, 0);
            const roomCost = roomResult.rows.reduce((sum, room) => sum + (room.DAILY_COST * room.DAYS_STAYED), 0);

            // Prepare response
            const response = {
                patientDetails: {
                    id: patientResult.rows[0].PID,
                    name: patientResult.rows[0].FULL_NAME,
                    gender: patientResult.rows[0].GENDER,
                    address: patientResult.rows[0].ADDRESS,
                    diseaseTreated: diagnosisResult.rows[0]?.DISEASE || 'Not specified'
                },
                medicines: medicineResult.rows.map(med => ({
                    name: med.MNAME,
                    quantity: med.QTY,
                    cost: med.UNIT_COST,
                    date: med.MED_DATE,
                    totalCost: med.TOTAL_COST
                })),
                tests: testResult.rows.map(test => ({
                    name: test.TNAME,
                    cost: test.COST,
                    date: test.TESTDATE
                })),
                roomDetails: roomResult.rows.map(room => ({
                    type: room.ROOMTYPE,
                    daysStayed: room.DAYS_STAYED,
                    dailyCost: room.DAILY_COST,
                    totalCost: room.DAILY_COST * room.DAYS_STAYED
                })),
                summary: {
                    medicineCost,
                    testCost,
                    roomCost,
                    totalAmount: medicineCost + testCost + roomCost
                }
            };

            res.json(response);

        } catch (err) {
            console.error('Error in getBillDetails:', err);
            res.status(500).json({ 
                error: 'Error fetching bill details',
                details: err.message 
            });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err);
                }
            }
        }
    },

    generateBill: async (req, res) => {
        let connection;
        try {
            const { patientId, medicineCost, testCost, roomCost } = req.body;
            
            connection = await oracledb.getConnection(dbConfig);

            // Insert the bill record
            const insertQuery = `
                INSERT INTO Bill (
                    pid, 
                    mcost, 
                    tcost, 
                    roomcharges, 
                    othercharges, 
                    billdate
                ) VALUES (
                    :pid, 
                    :mcost, 
                    :tcost, 
                    :roomcharges, 
                    0, 
                    SYSDATE
                )
            `;

            await connection.execute(
                insertQuery,
                {
                    pid: patientId,
                    mcost: medicineCost,
                    tcost: testCost,
                    roomcharges: roomCost
                }
            );

            await connection.commit();

            res.json({ 
                success: true, 
                message: 'Bill generated successfully',
                billDate: new Date()
            });

        } catch (err) {
            console.error('Error in generateBill:', err);
            res.status(500).json({ 
                error: 'Error generating bill',
                details: err.message 
            });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err);
                }
            }
        }
    }
};

module.exports = billController; 