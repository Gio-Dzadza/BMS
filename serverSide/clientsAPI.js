const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = (db, upload) => { // Accept the db object as a parameter
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

    //insert api
    router.post('/clients/insert', upload.single('clientImage'), (req, res)=>{
        const Email = req.body.Email;
        const FirstName = req.body.FirstName;
        const idNumber = req.body.idNumber;
        const phoneNumber = req.body.phoneNumber;
        //const clientImage = req.file.filename;
        let clientImage = req.file;

        if(clientImage === undefined){
            clientImage = null;
        } else{
            clientImage = req.file.filename;
        }

        //registraciisas parolis daheshva
        const sqlInsert = "INSERT INTO clients (Client_FirstName, ID_Number, Email, Phone_Number, Client_Image) VALUES (?,?,?,?,?);";
        /*Use the getConnection method to retrieve a connection from the pool*/
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Perform the query using the acquired connection
            connection.query(sqlInsert,[FirstName, idNumber, Email, phoneNumber, clientImage], (err, result) => {// Add userImage to the query parameters
                
                //const clientId = result.insertId;
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
                
                /* Release the connection once the query is done*/
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

    //delete api
    router.delete('/clients/delete/:id', (req,res)=>{
        const clientId = req.params.id;
        const sqlDelete = 
        "DELETE FROM clients WHERE id = ?;";
        
        /*Use the getConnection method to retrieve a connection from the pool*/
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Perform the query using the acquired connection
            connection.query(sqlDelete, clientId, (err, result) => {
                /* Release the connection once the query is done*/
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                // Delete the associated folder and files
                const clientFolderPath = path.join(__dirname, 'public', 'uploads', 'clients', clientId.toString());
                if (fs.existsSync(clientFolderPath)) {
                    fs.readdirSync(clientFolderPath).forEach((file) => {
                        const filePath = path.join(clientFolderPath, file);
                        fs.unlinkSync(filePath); // Delete individual file
                    });
                    fs.rmdirSync(clientFolderPath); // Delete the folder
                }
                res.json({deleted: true, message: 'Successfully deleted folder and record'});
                // res.send('Successfully deleted');
                console.log(result);
            });
        });
    });

    //change api
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
                        // Update project folders here
                        const clientIdfolder = clientId;
                        const clientFolderPath = path.join(__dirname, 'public', 'uploads', 'clients', clientIdfolder.toString());
                        if(fs.existsSync(clientFolderPath)) {
                            fs.readdirSync(clientFolderPath).forEach((file) => {
                                const filePath = path.join(clientFolderPath, file);
                                fs.unlinkSync(filePath); // Delete individual file
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

  return router; // Return the router from the function
};
