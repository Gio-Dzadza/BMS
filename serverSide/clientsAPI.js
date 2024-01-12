const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = (db, upload) => { 
    router.get('/get/clients', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.clients;";
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
            res.json({ auth: true, result: result });
        });
        });
    });

    
    router.post('/clients/insert', upload.single('clientImage'), (req, res)=>{
        const Email = req.body.Email;
        const FirstName = req.body.FirstName;
        const idNumber = req.body.idNumber;
        const phoneNumber = req.body.phoneNumber;
        
        let clientImage = req.file;

        if(clientImage === undefined){
            clientImage = null;
        } else{
            clientImage = req.file.filename;
        }

        
        const sqlInsert = "INSERT INTO clients (Client_FirstName, ID_Number, Email, Phone_Number, Client_Image) VALUES (?,?,?,?,?);";
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlInsert,[FirstName, idNumber, Email, phoneNumber, clientImage], (err, result) => {
                
                
                const clientIdfolder = result.insertId;
                const clientFolderPath = path.join(__dirname, 'public', 'uploads', 'clients', clientIdfolder.toString());
                if (!fs.existsSync(clientFolderPath)) {
                    fs.mkdirSync(clientFolderPath);
                }
                if(clientImage){
                    const oldPath = req.file.path;
                    const newFilename = req.file.filename;
                    const newPath = path.join(clientFolderPath, newFilename);
                    fs.renameSync(oldPath, newPath);
                    console.log(newFilename);
                }
                
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

    
    router.delete('/clients/delete/:id', (req,res)=>{
        const clientId = req.params.id;
        const sqlDelete = 
        "DELETE FROM clients WHERE id = ?;";
        
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlDelete, clientId, (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                
                const clientFolderPath = path.join(__dirname, 'public', 'uploads', 'clients', clientId.toString());
                if (fs.existsSync(clientFolderPath)) {
                    fs.readdirSync(clientFolderPath).forEach((file) => {
                        const filePath = path.join(clientFolderPath, file);
                        fs.unlinkSync(filePath); 
                    });
                    fs.rmdirSync(clientFolderPath); 
                }
                res.json({deleted: true, message: 'Successfully deleted folder and record'});
                
                console.log(result);
            });
        });
    });

    
    router.put('/clients/update/:id', upload.single('clientImage'), (req,res)=>{
        const clientId = req.params.id;
        const { FirstName, LastName, Email, idNumber, phoneNumber } = req.body;
        const sqlSelectClientImage = "SELECT Client_Image FROM clients WHERE id = ?";
        const sqlUpdate = 
        "UPDATE clients SET Client_FirstName = ?, Client_LastName = ?, ID_Number = ?, Email = ?, Phone_Number = ?, Client_Image = ?  WHERE id = ?";

        db.getConnection((err, connection) => {
            if (!req.file || !req.file.filename) {
                connection.query(sqlSelectClientImage, [clientId], (err, clientImageResult) => {
                    if (err) {
                        connection.release();
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    const currentClientImage = clientImageResult[0].Client_Image;
                    connection.query(
                        sqlUpdate,
                        [FirstName, LastName, idNumber, Email, phoneNumber, currentClientImage, clientId],
                        (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            res.send('Successfully updated!');
                            console.log(result);
                        }
                    );
                });
            } else {
                const clientImage = req.file.filename;
                connection.query(
                    sqlUpdate,
                    [FirstName, LastName, idNumber, Email, phoneNumber, clientImage, clientId],
                    (err, result) => {
                        connection.release();
                        if (err) {
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        
                        const clientIdfolder = clientId;
                        const clientFolderPath = path.join(__dirname, 'public', 'uploads', 'clients', clientIdfolder.toString());
                        if(fs.existsSync(clientFolderPath)) {
                            fs.readdirSync(clientFolderPath).forEach((file) => {
                                const filePath = path.join(clientFolderPath, file);
                                fs.unlinkSync(filePath); 
                            });
                            const oldPath = req.file.path;
                            const Filename = req.file.filename;
                            const newPath = path.join(clientFolderPath, Filename);
                            fs.renameSync(oldPath, newPath);
                            console.log(Filename)
                        }
                        res.send('Successfully updated!');
                        console.log(result);
                    }
                );
            }
        });
    });

    return router; 
};
