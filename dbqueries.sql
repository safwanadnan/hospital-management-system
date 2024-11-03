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
    FOREIGN KEY(nid) REFERENCES Employee(empid),
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
    mcost FLOAT,  -- Removed precision specification
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

-- Set delimiter for trigger definitions
DELIMITER //

-- Modified trigger to use Oracle syntax
CREATE OR REPLACE TRIGGER transfer_to_passive
BEFORE DELETE ON Employee
FOR EACH ROW
BEGIN
    INSERT INTO Employee_Inactive(empid, fname, mname, lname, gender, emptype, 
        Hno, street, city, state, date_of_joining, date_of_leaving, email)
    VALUES(:OLD.empid, :OLD.fname, :OLD.mname, :OLD.lname, :OLD.gender, :OLD.emptype,
        :OLD.Hno, :OLD.street, :OLD.city, :OLD.state, :OLD.date_of_joining, SYSDATE, :OLD.email);
END;
//

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

CREATE OR REPLACE TRIGGER employee_on_delete
AFTER DELETE ON Employee
FOR EACH ROW
DECLARE
    v_dept_head NUMBER;
    v_min_emp NUMBER;
    v_min_since DATE;
BEGIN
    -- Insert into previous department record
    INSERT INTO Prev_Department(empid, deptid, date_of_joining, date_of_leaving)
    VALUES(:OLD.empid, :OLD.deptid, :OLD.since, SYSDATE);
    
    -- Handle department head replacement
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
