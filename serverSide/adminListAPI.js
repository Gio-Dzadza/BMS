const express = require('express');
const router = express.Router();


module.exports = (db) => { 

    
    router.get('/get/subservices', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.subservices;";
        db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).json({ auth: false, message: 'Internal Server Error' });
            return;
        }
        connection.query(sqlSelect, (err, result) => {
            connection.release();
            if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).json({ auth: false, message: 'Internal Server Error' });
            return;
            }
            
            res.send(result);
        });
        });
    });

    
    router.get('/get/subservicestat', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.subservice_statuses;";
        db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).json({ auth: false, message: 'Internal Server Error' });
            return;
        }
        connection.query(sqlSelect, (err, result) => {
            connection.release();
            if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).json({ auth: false, message: 'Internal Server Error' });
            return;
            }
            
            res.send(result);
        });
        });
    });

    
    router.get('/get/projectStatuses', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.project_status;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.get('/get/Currency', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.currency;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });
    
    
    router.get('/get/projectTypes', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.project_types;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.get('/get/services', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.services;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.get('/get/payStatuses', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.pay_status;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.get('/get/serviceStatuses', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.service_status;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.get('/get/specialties', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.specialties;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.get('/get/userStatuses', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.user_status;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.get('/get/userTypes', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.user_types;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlSelect, (err, result) => {
                
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send(result);
            });
        });
    });

    
    router.delete('/lists/delete/:id', (req, res) => {
        const projectId = req.params.id;
        const tableName = req.body.tableName;
        
        const sqlDelete = `DELETE FROM ${tableName} WHERE id = ?;`;
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            connection.query(sqlDelete, projectId, (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.json({ deleted: true, message: 'Record is successfully deleted' });
                console.log(result);
            });
        });
    });

    
    router.post('/lists/insert', (req, res) => {
        const name = req.body.name;
        const tableName = req.body.tableName;
        let field = '';
        if(tableName === "pay_status"){
            field = "pay_status_name";
        } else if(tableName === "project_status"){
            field = "Project_Status_Name";
        } else if(tableName === "project_types"){
            field = "Project_Type_Name";
        } else if(tableName === "service_status"){
            field = "Service_Status_Name";
        } else if(tableName === "currency"){
            field = "Currency_Name";
        } else if(tableName === "services"){
            field = "Service_Name";
        } else if(tableName === "specialties"){
            field = "Specialty_name";
        } else if(tableName === "user_status"){
            field = "User_Status_Name";
        } else if(tableName === "user_types"){
            field = "Type_Name";
        };
        const sqlInsertServicesToProject = `INSERT INTO ${tableName} (${field}) VALUES (?);`;
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            connection.query(sqlInsertServicesToProject, [name], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send('Successfully added!');
                console.log(result);
            });
        });
    });

    
    router.post('/subservices/insert', (req, res) => {
        const name = req.body.name;
        const serviceId = req.body.serviceId;
        const sqlInsertSubServices = `INSERT INTO subservices (name, service_id) VALUES (?,?);`;
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            connection.query(sqlInsertSubServices, [name, serviceId], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send('Successfully added!');
                console.log(result);
            });
        });
    });

    
    router.put('/lists/update/:id', (req, res) => {
        const itemId = req.params.id;
        const tableName = req.body.tableName;
        const name = req.body.name;
        
        let field = '';
        if(tableName === "pay_status"){
            field = "pay_status_name";
        } else if(tableName === "project_status"){
            field = "Project_Status_Name";
        } else if(tableName === "project_types"){
            field = "Project_Type_Name";
        } else if(tableName === "service_status"){
            field = "Service_Status_Name";
        } else if(tableName === "currency"){
            field = "Currency_Name";
        } else if(tableName === "services"){
            field = "Service_Name";
        } else if(tableName === "specialties"){
            field = "Specialty_name";
        } else if(tableName === "user_status"){
            field = "User_Status_Name";
        } else if(tableName === "user_types"){
            field = "Type_Name";
        } else if(tableName === "subservices"){
            field = "name";
        };
        
        const sqlUpdate = `UPDATE ${tableName} SET ${field} = ? WHERE id = ?`;
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error establishing database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(
                sqlUpdate,
                [name, itemId],
                (err, result) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    connection.release();
                    res.send('Successfully updated!');
                    console.log(result);
            });
        });
    });
    
    router.put('/subservices/update/:id', (req, res) => {
        const itemId = req.params.id;
        const name = req.body.name;
        const serviceId = req.body.serviceId;
        const sqlUpdate = `UPDATE subservices SET name = ?, service_id = ? WHERE id = ?`;
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error establishing database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(
                sqlUpdate,
                [name, serviceId, itemId],
                (err, result) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    connection.release();
                    res.send('Successfully updated!');
                    console.log(result);
            });
        });
    });

    return router; 
};
