CREATE TABLE patient(
    pid int,
    fname varchar(20) not null,
    lname varchar(20),
    gender varchar(6) not null,
    dob date not null,
    blood_group varchar(3),
    doc_id int,
    HNo varchar(10),
    street varchar(20),
    city varchar(16),
    state varchar(20),
    email varchar(30),
    Primary Key(pid));

-- Employee Table
CREATE TABLE Employee(
    empid INT,
    fname VARCHAR(20) NOT NULL,
    mname VARCHAR(20),
    lname VARCHAR(20),
    gender VARCHAR(6) NOT NULL,
    emptype VARCHAR(20) NOT NULL,
    Hno VARCHAR(10),
    street VARCHAR(20),
    city VARCHAR(20),
    state VARCHAR(20),
    date_of_joining DATE,
    email VARCHAR(30),
    deptid INT,
    since DATE,
    date_of_birth DATE,
    PRIMARY KEY(empid)
);

-- Department Table
CREATE TABLE Department(
    deptid INT,
    dname VARCHAR(20) NOT NULL,
    dept_headid INT,  -- Removed precision specification
    PRIMARY KEY(deptid)
);

-- Salary Table
CREATE TABLE Salary(
    etype VARCHAR(20),
    salary FLOAT,  -- Removed precision specification
    PRIMARY KEY(etype)
);

-- Nurse Assigned Table
CREATE TABLE Nurse_Assigned(
    nid INT,
    countpatient INT,
    PRIMARY KEY(nid),
    FOREIGN KEY(nid) REFERENCES Employee(empid)
);

-- Out Patient Table
CREATE TABLE Out_Patient(
    pid INT,
    arrival_date DATE,
    disease VARCHAR(40),
    PRIMARY KEY(pid, arrival_date),
    FOREIGN KEY(pid) REFERENCES Patient(pid)
);

-- Room Table
CREATE TABLE Room(
    rid INT,
    roomtype VARCHAR(20),
    PRIMARY KEY(rid)
);

-- In Patient Table
CREATE TABLE In_Patient(
    pid INT,
    nid INT,
    rid INT,
    arrival_date DATE,
    discharge_date DATE,
    disease VARCHAR(40),
    PRIMARY KEY(pid, arrival_date),
    FOREIGN KEY(pid) REFERENCES Patient(pid),
    FOREIGN KEY(nid) REFERENCES Employee(empid) ON DELETE SET NULL,
    FOREIGN KEY(rid) REFERENCES Room(rid)
);

-- Room Cost Table
CREATE TABLE Room_Cost(
    roomtype VARCHAR(20),
    rcost INT,
    PRIMARY KEY(roomtype)  -- Corrected column name for primary key
);

-- Relative Table
CREATE TABLE Relative(
    pid INT,
    rname VARCHAR(30),
    rtype VARCHAR(30),
    pno VARCHAR(11),
    PRIMARY KEY(pid)
);

-- Test Table
CREATE TABLE Test(
    tid INT,
    tname VARCHAR(20),
    tcost FLOAT,  -- Removed precision specification
    PRIMARY KEY(tid)
);

-- Had Test Table
CREATE TABLE Had_Test(
    pid INT,
    tid INT,
    testdate DATE,
    PRIMARY KEY(pid, tid, testdate),
    FOREIGN KEY(pid) REFERENCES Patient(pid),
    FOREIGN KEY(tid) REFERENCES Test(tid)
);

-- Medicine Table
CREATE TABLE Medicine(
    mid INT,
    mname VARCHAR(40) NOT NULL,
    mcost FLOAT,  
    PRIMARY KEY(mid)
);

-- Had Medicine Table
CREATE TABLE Had_Medicine(
    pid INT,
    mid INT,
    med_date DATE,
    qty INT,
    PRIMARY KEY(pid, mid, med_date),
    FOREIGN KEY(pid) REFERENCES Patient(pid),
    FOREIGN KEY(mid) REFERENCES Medicine(mid)
);

-- Patient Phone Table
CREATE TABLE Pt_Phone(
    pid INT,
    phoneno VARCHAR(10),
    PRIMARY KEY(pid, phoneno),
    FOREIGN KEY(pid) REFERENCES Patient(pid)
);

-- Employee Phone Table
CREATE TABLE Emp_Phone(
    empid INT,
    phoneno VARCHAR(10),
    PRIMARY KEY(empid, phoneno)
);

-- Bill Table
CREATE TABLE Bill(
    pid INT,
    mcost FLOAT,
    tcost FLOAT,
    roomcharges FLOAT,
    othercharges FLOAT,
    billdate DATE,
    PRIMARY KEY(pid, billdate)
);

-- Employee Inactive Table
CREATE TABLE Employee_Inactive(
    empid INT,
    fname VARCHAR(20) NOT NULL,
    mname VARCHAR(20),
    lname VARCHAR(20),
    gender VARCHAR(6) NOT NULL,
    emptype VARCHAR(20) NOT NULL,
    Hno VARCHAR(10),
    street VARCHAR(20),
    city VARCHAR(20),
    state VARCHAR(20),
    date_of_joining DATE,
    date_of_leaving DATE,
    email VARCHAR(30),
    PRIMARY KEY(empid)
);

CREATE TABLE Prev_Department(
    empid INT,
    deptid INT,
    date_of_joining DATE,
    date_of_leaving DATE,
    PRIMARY KEY(empid, deptid, date_of_leaving)
);

CREATE TABLE Admin_Users (
    username VARCHAR(30),
    password VARCHAR(30),
    PRIMARY KEY(username)
);

-- Set delimiter for trigger definitions
DELIMITER //

CREATE OR REPLACE TRIGGER on_insert_employee_update_dept 
AFTER INSERT ON Employee
FOR EACH ROW
DECLARE
    v_dept_head NUMBER;
BEGIN
    SELECT dept_headid INTO v_dept_head
    FROM Department 
    WHERE deptid = :NEW.deptid;
    
    IF v_dept_head IS NULL THEN
        UPDATE Department
        SET dept_headid = :NEW.empid
        WHERE deptid = :NEW.deptid;
    END IF;
END;
//

CREATE OR REPLACE TRIGGER transfer_to_prev_department
AFTER UPDATE ON Employee
FOR EACH ROW
DECLARE
    v_dept_head NUMBER;
    v_min_emp NUMBER;
    v_min_since DATE;
BEGIN
    IF :NEW.deptid != :OLD.deptid THEN
        -- Insert into previous department record
        INSERT INTO Prev_Department(empid, deptid, date_of_joining, date_of_leaving)
        VALUES(:OLD.empid, :OLD.deptid, :OLD.since, SYSDATE);
        
        -- Check and update new department head if needed
        SELECT dept_headid INTO v_dept_head
        FROM Department 
        WHERE deptid = :NEW.deptid;
        
        IF v_dept_head IS NULL THEN
            UPDATE Department
            SET dept_headid = :NEW.empid
            WHERE deptid = :NEW.deptid;
        END IF;
        
        -- Handle old department head replacement
        SELECT dept_headid INTO v_dept_head
        FROM Department 
        WHERE deptid = :OLD.deptid;
        
        IF :OLD.empid = v_dept_head THEN
            SELECT MIN(empid) INTO v_min_emp
            FROM Employee 
            WHERE deptid = :OLD.deptid
            AND since = (
                SELECT MIN(since)
                FROM Employee
                WHERE deptid = :OLD.deptid
            );
            
            UPDATE Department 
            SET dept_headid = v_min_emp 
            WHERE deptid = :OLD.deptid;
        END IF;
    END IF;
END;
//
-- Create a single combined trigger
CREATE OR REPLACE TRIGGER handle_employee_deletion
BEFORE DELETE ON Employee
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    -- Handle Nurse_Assigned for nurses
    IF :OLD.emptype = 'NURSE' THEN
        DELETE FROM Nurse_Assigned 
        WHERE nid = :OLD.empid;
    END IF;
    
    -- Handle Employee_Inactive transfer
    SELECT COUNT(*) INTO v_count
    FROM Employee_Inactive
    WHERE empid = :OLD.empid;
    
    IF v_count = 0 THEN
        INSERT INTO Employee_Inactive(
            empid, fname, mname, lname, gender, emptype, 
            Hno, street, city, state, date_of_joining,
            date_of_leaving, email
        ) VALUES (
            :OLD.empid, :OLD.fname, :OLD.mname, :OLD.lname,
            :OLD.gender, :OLD.emptype, :OLD.Hno, :OLD.street,
            :OLD.city, :OLD.state, :OLD.date_of_joining,
            SYSDATE, :OLD.email
        );
    ELSE
        UPDATE Employee_Inactive
        SET date_of_leaving = SYSDATE,
            fname = :OLD.fname,
            mname = :OLD.mname,
            lname = :OLD.lname,
            gender = :OLD.gender,
            emptype = :OLD.emptype,
            Hno = :OLD.Hno,
            street = :OLD.street,
            city = :OLD.city,
            state = :OLD.state,
            email = :OLD.email
        WHERE empid = :OLD.empid;
    END IF;
END;
/

-- Trigger to maintain Nurse_Assigned consistency
CREATE OR REPLACE TRIGGER maintain_nurse_assigned
AFTER INSERT OR UPDATE ON Employee
FOR EACH ROW
WHEN (NEW.emptype = 'NURSE')
BEGIN
    MERGE INTO Nurse_Assigned na
    USING dual ON (na.nid = :NEW.empid)
    WHEN NOT MATCHED THEN
        INSERT (nid, countpatient)
        VALUES (:NEW.empid, 0);
END;
//

DELIMITER ;

-- Sample Data for Test and Salary Tables
INSERT INTO Test VALUES (1, 'X-RAY', 100);
INSERT INTO Test VALUES (2, 'BLOOD TEST', 300);
-- (add other Test values as needed)

INSERT INTO Salary VALUES ('DOCTOR', 70000);
INSERT INTO Salary VALUES ('NURSE', 25000);
-- (add other Salary values as needed)

-- Sample Data for Medicine Table
INSERT INTO Medicine VALUES (1, 'CROCINE', 10);
INSERT INTO Medicine VALUES (2, 'ASPIRIN', 8);
-- (add other Medicine values as needed)

-- Department Data
INSERT INTO Department (deptid, dname) VALUES
(1, 'Cardiology'),
(2, 'Pediatrics'),
(3, 'Orthopedics'),
(4, 'Neurology'),
(5, 'Emergency');

-- Employee Data (Doctors, Nurses, and Staff)
INSERT INTO Employee (empid, fname, mname, lname, gender, emptype, Hno, street, city, state, date_of_joining, email, deptid, since, date_of_birth) 
VALUES
-- Doctors
(101, 'John', 'A', 'Smith', 'Male', 'DOCTOR', '123', 'Oak Street', 'Chicago', 'Illinois', 
    TO_DATE('2020-01-15', 'YYYY-MM-DD'), 'john.smith@hospital.com', 1, 
    TO_DATE('2020-01-15', 'YYYY-MM-DD'), TO_DATE('1975-06-20', 'YYYY-MM-DD')),
(102, 'Sarah', 'B', 'Johnson', 'Female', 'DOCTOR', '456', 'Maple Ave', 'Chicago', 'Illinois', 
    TO_DATE('2019-03-20', 'YYYY-MM-DD'), 'sarah.j@hospital.com', 2, 
    TO_DATE('2019-03-20', 'YYYY-MM-DD'), TO_DATE('1980-08-15', 'YYYY-MM-DD')),
(103, 'Michael', 'C', 'Brown', 'Male', 'DOCTOR', '789', 'Pine Road', 'Chicago', 'Illinois', 
    TO_DATE('2018-06-10', 'YYYY-MM-DD'), 'michael.b@hospital.com', 3, 
    TO_DATE('2018-06-10', 'YYYY-MM-DD'), TO_DATE('1978-11-30', 'YYYY-MM-DD')),
-- Nurses
(201, 'Emily', NULL, 'Davis', 'Female', 'NURSE', '321', 'Cedar Lane', 'Chicago', 'Illinois', 
    TO_DATE('2021-02-01', 'YYYY-MM-DD'), 'emily.d@hospital.com', 1, 
    TO_DATE('2021-02-01', 'YYYY-MM-DD'), TO_DATE('1990-04-12', 'YYYY-MM-DD')),
(202, 'James', NULL, 'Wilson', 'Male', 'NURSE', '654', 'Birch St', 'Chicago', 'Illinois', 
    TO_DATE('2020-11-15', 'YYYY-MM-DD'), 'james.w@hospital.com', 2, 
    TO_DATE('2020-11-15', 'YYYY-MM-DD'), TO_DATE('1988-07-22', 'YYYY-MM-DD'));

-- Room Types and Costs
INSERT INTO Room (rid, roomtype) VALUES
(1, 'General'),
(2, 'Semi-Private'),
(3, 'Private'),
(4, 'ICU'),
(5, 'Operation Theater');

INSERT INTO Room_Cost (roomtype, rcost) VALUES
('General', 1000),
('Semi-Private', 2000),
('Private', 3500),
('ICU', 5000),
('Operation Theater', 8000);

-- Additional Test Data
INSERT INTO Test (tid, tname, tcost) VALUES
(3, 'MRI', 2500),
(4, 'CT Scan', 1800),
(5, 'ECG', 500),
(6, 'Ultrasound', 800);

-- Additional Medicine Data
INSERT INTO Medicine (mid, mname, mcost) VALUES
(3, 'Paracetamol', 5),
(4, 'Amoxicillin', 15),
(5, 'Ibuprofen', 8),
(6, 'Omeprazole', 12);

-- Patient Data
INSERT INTO Patient (pid, fname, lname, gender, dob, blood_group, doc_id, HNo, street, city, state, email) VALUES
(1001, 'Robert', 'Miller', 'Male', TO_DATE('1990-05-15', 'YYYY-MM-DD'), 'A+', 101, '111', 'First St', 'Chicago', 'Illinois', 'robert.m@email.com'),
(1002, 'Lisa', 'Anderson', 'Female', TO_DATE('1985-08-22', 'YYYY-MM-DD'), 'B-', 102, '222', 'Second Ave', 'Chicago', 'Illinois', 'lisa.a@email.com'),
(1003, 'David', 'Taylor', 'Male', TO_DATE('1978-11-30', 'YYYY-MM-DD'), 'O+', 103, '333', 'Third Road', 'Chicago', 'Illinois', 'david.t@email.com');

-- Patient Phone Numbers
INSERT INTO Pt_Phone (pid, phoneno) VALUES
(1001, '3121234567'),
(1001, '3121234568'),
(1002, '3129876543');

-- Employee Phone Numbers
INSERT INTO Emp_Phone (empid, phoneno) VALUES
(101, '3125551234'),
(102, '3125555678'),
(201, '3125559012');

-- Out-Patient Records
INSERT INTO Out_Patient (pid, arrival_date, disease) VALUES
(1001, TO_DATE('2024-03-01', 'YYYY-MM-DD'), 'Fever'),
(1002, TO_DATE('2024-03-02', 'YYYY-MM-DD'), 'Migraine');

-- In-Patient Records
INSERT INTO In_Patient (pid, nid, rid, arrival_date, discharge_date, disease) VALUES
(1003, 201, 3, TO_DATE('2024-02-28', 'YYYY-MM-DD'), TO_DATE('2024-03-05', 'YYYY-MM-DD'), 'Pneumonia');

-- Patient Relatives
INSERT INTO Relative (pid, rname, rtype, pno) VALUES
(1001, 'Mary Miller', 'Spouse', '31299999999'),
(1002, 'John Anderson', 'Spouse', '31288888888');

-- Test Records
INSERT INTO Had_Test (pid, tid, testdate) VALUES
(1001, 1, TO_DATE('2024-03-01', 'YYYY-MM-DD')),
(1001, 2, TO_DATE('2024-03-01', 'YYYY-MM-DD')),
(1002, 5, TO_DATE('2024-03-02', 'YYYY-MM-DD'));

-- Medicine Records
INSERT INTO Had_Medicine (pid, mid, med_date, qty) VALUES
(1001, 1, TO_DATE('2024-03-01', 'YYYY-MM-DD'), 2),
(1001, 3, TO_DATE('2024-03-01', 'YYYY-MM-DD'), 1),
(1002, 5, TO_DATE('2024-03-02', 'YYYY-MM-DD'), 3);

-- Bills
INSERT INTO Bill (pid, mcost, tcost, roomcharges, othercharges, billdate) VALUES
(1001, 25.00, 400.00, 0.00, 50.00, TO_DATE('2024-03-01', 'YYYY-MM-DD')),
(1002, 24.00, 500.00, 0.00, 50.00, TO_DATE('2024-03-02', 'YYYY-MM-DD')),
(1003, 45.00, 0.00, 10500.00, 100.00, TO_DATE('2024-03-05', 'YYYY-MM-DD'));

-- Admin Users
INSERT INTO Admin_Users (username, password) VALUES
('safwan', 'safwan'),
('hussain', 'hussain'),
('hayatullah', 'hayatullah');