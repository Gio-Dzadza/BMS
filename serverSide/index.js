const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const cookieParser =  require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const contentDisposition = require('content-disposition');
const axios = require('axios');
const archiver = require('archiver');
//const compression = require('compression');


const db = mysql.createPool({
    // host: 'localhost',
    // user: 'giodzadza',
    // password: 'Jokerv923003!',
    // database: 'bms',
    // authPlugins:{
    //     mysql_clear_password: () => () => Buffer.from('Jokerv923003!'),
    // },
    host: 'localhost',
    user: 'root',
    password: '3003',
    database: 'bms',
});

const oneDayInSeconds = 86400;
app.use(cors({
    // origin: 'http://159.223.19.10',
    // origin: 'https://104.248.129.121',
    origin:  ["http://localhost:3000"],
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    key: "userid",
    secret: 'secretSession',
    resave:false,
    saveUninitialized: false,
    cookie: {
        // expires: 86400
        maxAge: oneDayInSeconds * 1000, // maxAge is specified in milliseconds
        secure: false, // Set to true if using HTTPS
        httpOnly: true, // Prevents client-side JavaScript access to the cookie
    }
}));
app.use(express.static('public'));
//app.use(compression());//for file compression

// Define storage for the uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        let buffer = Buffer.from(file.originalname, 'binary');
        let utf8String = buffer.toString('utf8');
        cb(null, utf8String);
    },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage,
	defParamCharset: 'utf8',
	defCharset: 'utf8',
    // limits: {
    //     fileSize: 10 * 1024 * 1024, // 10MB limit
    // },
});

/* Establish a connection with the MySQL server*/
db.getConnection((err, connection) => {
    if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
    }
    console.log('Connected to MySQL database!');
    connection.release();
});

//verifyJWT middleware
const onlyTokenJWT = (req, res, next)=>{
    const token = req.headers["x-access-token"];
    // console.log("Received token:", token);
    if(!token){
        res.json({auth:false, message: "token-ის მიღება ვერ მოხერხდა"});
        // res.send("token-ის მიღება ვერ მოხერხდა");
    } else{
        jwt.verify(token, "jwtSecret", (err, decoded)=>{
            if(err){
                res.json({auth: false, message: "აუტენთიფიკაციის გავლა ვერ მოხერხდა"})
            } else{
                req.userId = decoded.id;
                next();
            }
        })
    }
};

const verifyJWT = (req, res, next)=>{
    const token = req.headers["x-access-token"];
    // console.log("Received token:", token);
    if(!token){
        res.json({auth:false, message: "token-ის მიღება ვერ მოხერხდა"});
        // res.send("token-ის მიღება ვერ მოხერხდა");
    } else{
        jwt.verify(token, "jwtSecret", (err, decoded)=>{
            if(err){
                res.json({auth: false, message: "აუტენთიფიკაციის გავლა ვერ მოხერხდა"})
            } else{
                req.userId = decoded.id;
                req.userTypeId = decoded.userTypeId;
                if(req.userTypeId !== 1 && req.userTypeId !== 4){
                    res.json({
                        auth: false, 
                        message: "წვდომა შეზღუდულია!"
                    })
                } else{
                    next();
                };
            };
        });
    };
};

//for client api-s
const clientsapi = require('./clientsAPI');
app.use('/api/clapi', verifyJWT, clientsapi(db, upload));

//for projects api-s
const projectsapi = require('./projectsAPI');
app.use('/api/projapi', projectsapi(db, upload));

//for client api-s
const adminListAPI = require('./adminListAPI');
app.use('/api/adminapi', verifyJWT, adminListAPI(db));

//for file downloading:
app.get('/api/projapi/downloads/:projectId/:filename', (req, res) => {
    const filename  = req.params.filename;
    const projectId = req.params.projectId;
    //const projectFolderPath = path.join(__dirname, 'public', 'uploads', projectId);
    //const filePath = path.join(__dirname, 'public', 'uploads', projectId, fileName);
    const file = path.join(__dirname, 'public', 'uploads', 'projects', projectId, filename);
    res.download(file, filename);
});

//for zip download
app.get('/api/projapi/downloads/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    const projectFolderPath = path.join(__dirname, 'public', 'uploads', 'projects', projectId);
    const zipFileName = `project_${projectId}_files.zip`;
    
    // Create a new instance of archiver to create a ZIP archive
    const archive = archiver('zip', {
        zlib: { level: 9 } // Compression level
    });

    // Pipe the archive data to the response object
    archive.pipe(res);

    // Read the files in the project folder and add them to the archive
    fs.readdir(projectFolderPath, (err, files) => {
        if (err) {
            res.status(500).send('Error reading project folder.');
            return;
        }

        if (files.length === 0) {
            // No files in the project folder
            res.status(404).send('No files found in the project folder.');
            return;
        }

        files.forEach(file => {
            const filePath = path.join(projectFolderPath, file);
            archive.file(filePath, { name: file });
        });

        // Finalize the archive and send it to the client
        archive.finalize();
    });

    // Set the response headers for downloading
    res.attachment(zipFileName);
});

// Route for filename retrieve
app.get('/api/projapi/:projectId/files', (req, res) => {
    const projectId = req.params.projectId;
    const projectFolderPath = path.join(__dirname, 'public', 'uploads', 'projects', projectId);
    // Check if the project folder exists
    if (!fs.existsSync(projectFolderPath)) {
        return res.status(404).send('Project folder not found.');
    }
    // Read the contents of the project folder
    fs.readdir(projectFolderPath, (err, files) => {
        if (err) {
        console.error('Error reading project folder:', err);
        return res.status(500).send('Internal Server Error');
        }
      // Send the list of files to the client
        res.json({ files });
    });
});

// Route for file content retrieve
app.get('/api/projapi/:projectId/files/:fileName', (req, res) => {
    const projectId = req.params.projectId;
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'public', 'uploads', 'projects', projectId, fileName);
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found.');
    }
    // Read the file and send it as a response
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Set appropriate headers using content-disposition package
        res.setHeader('Content-Disposition', contentDisposition(fileName));
        res.setHeader('Content-Length', data.length);
        res.setHeader('Content-Type', 'application/octet-stream');
        // Send the file content as the response
        res.end(data);
    });
});

//delete file
app.delete('/api/projapi/delete/:projectId/:filename', (req, res) => {
    const encodedFilename = req.params.filename;
    const filename = decodeURIComponent(encodedFilename);
    //const filename = req.params.filename;
    // const filename = decodeURIComponent(req.params.filename);
    const projectId = req.params.projectId;
    const file = path.join(__dirname, 'public', 'uploads', 'projects', projectId, filename);


    fs.unlink(file, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            res.status(500).json({ error: 'Could not delete the file.' });
        } else {
            console.log('File deleted successfully:', file);
            db.getConnection((err, connection) => {
                if (err) {
                    console.error('Error establishing database connection:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                const sqlSelectProjectDocs = "UPDATE projects SET Project_Docs = TRIM(BOTH ',' FROM REPLACE(Project_Docs, ?, '')) WHERE id = ?;";
                // Execute the SQL query using the connection pool
                connection.query(sqlSelectProjectDocs, [filename, projectId], (err, deleteResult) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    } else {
                        // Handle the successful query execution (if needed)
                        res.send('Filename' + ' ' + filename + ' ' + 'Successfully deleted!');
                        console.log(deleteResult);
                    }
                });
            });
        }
    });
});

//routes for users
app.get('/api/getUser', onlyTokenJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user;";
    //Use the getConnection method to retrieve a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlSelect, (err, result) => {
            // Release the connection once the query is done
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json({auth:true, result: result});
        });
    });
});

//get all users
app.get('/api/get', verifyJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user;";
    //Use the getConnection method to retrieve a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlSelect, (err, result) => {
            // Release the connection once the query is done
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json({auth:true, result: result});
        });
    });
});

//get admin users
app.get('/api/getAdmins', verifyJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user WHERE User_Type_id = 1;";
    //Use the getConnection method to retrieve a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlSelect, (err, result) => {
            // Release the connection once the query is done
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json({auth:true, result: result});
        });
    });
});

//get show_hide records
app.get('/api/getShowHideRecs', onlyTokenJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.show_hide;";
    //Use the getConnection method to retrieve a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlSelect, (err, result) => {
            // Release the connection once the query is done
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json({auth:true, result: result});
        });
    });
});

//for financial showhide
//change api
app.post('/api/permapi/updateShowHide', verifyJWT, (req, res) => {
    const { showHideRecordId, users} = req.body;
    const sqlUpdate = `UPDATE show_hide SET userIds = ? WHERE id = ${showHideRecordId}`;

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error establishing database connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        const userIdsString = users.length > 0 ? users.join(',') : '';
        // Logic to handle the update      
        connection.query(
            sqlUpdate,
            [userIdsString],
            (err, result) => {
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                connection.release();
                res.send('Financial info display mode successfully updated!');
                console.log(result);
        });
    });
});

//specialties
app.get('/api/get/specialty', (req, res) => {
    const sqlSelect = "SELECT * FROM bms.specialties;";
    //Use the getConnection method to retrieve a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlSelect, (err, result) => {
            // Release the connection once the query is done
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

//user statuses
app.get('/api/get/status', (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user_status;";
    //Use the getConnection method to retrieve a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlSelect, (err, result) => {
            // Release the connection once the query is done
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

//user types
app.get('/api/get/type', (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user_types;";
    //Use the getConnection method to retrieve a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlSelect, (err, result) => {
            // Release the connection once the query is done
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

//user insert api
app.post('/api/insert', verifyJWT, upload.single('userImage'), (req, res)=>{
    const Email = req.body.Email;
    const Password = req.body.Password;
    const FirstName = req.body.FirstName;
    const LastName = req.body.LastName;
    const userTypeId = req.body.userTypeId;
    const userSpecialtyId = req.body.userSpecialtyId;
    const userStatusId = req.body.userStatusId;
    //const userImage = req.file.filename;
    let userImage = req.file;

    if(userImage === undefined){
        userImage = null;
    } else{
        userImage = req.file.filename;
    }

    //registraciisas parolis daheshva
    bcrypt.hash(Password, saltRounds, (err, hash)=>{
        if(err){
            console.log(err);
        };
        const sqlInsert = "INSERT INTO user (FirstName, LastName, Email, Password, User_Specialty_id, User_Type_id, User_Status_id, User_Image) VALUES (?,?,?,?,?,?,?,?);";
        /*Use the getConnection method to retrieve a connection from the pool*/
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Perform the query using the acquired connection
            connection.query(sqlInsert,[FirstName, LastName, Email, hash, userSpecialtyId, userTypeId, userStatusId, userImage], (err, result) => {// Add userImage to the query parameters
                
                const userIdfolder = result.insertId;
                const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                if (!fs.existsSync(userFolderPath)) {
                    fs.mkdirSync(userFolderPath);
                }
                if(userImage){
                    const oldPath = req.file.path;
                    const newFilename = req.file.filename;
                    const newPath = path.join(userFolderPath, newFilename);
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
});

//user delete api
app.delete('/api/delete/:id', verifyJWT, (req,res)=>{
    const userId = req.params.id;
    const sqlDelete = 
    "DELETE FROM user WHERE id = ?;";
    /*Use the getConnection method to retrieve a connection from the pool*/
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Perform the query using the acquired connection
        connection.query(sqlDelete, userId, (err, result) => {
            /* Release the connection once the query is done*/
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Delete the associated folder and files
            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userId.toString());
            if (fs.existsSync(userFolderPath)) {
                fs.readdirSync(userFolderPath).forEach((file) => {
                    const filePath = path.join(userFolderPath, file);
                    fs.unlinkSync(filePath); // Delete individual file
                });
                fs.rmdirSync(userFolderPath); // Delete the folder
            }
            res.json({deleted: true, message: 'Successfully deleted folder and record'});
            // res.send('Successfully deleted');
            console.log(result);
        });
    });
});

//user update api
app.put('/api/update/:id', verifyJWT, upload.single('userImage'), (req, res) => {
    const userId = req.params.id;
    const { FirstName, LastName, Email, Password, User_Specialty_id, User_Type_id, User_Status_id } = req.body;
    const sqlSelectPassword = "SELECT Password FROM user WHERE id = ?";
    const sqlSelectUserImage = "SELECT User_Image FROM user WHERE id = ?";
    const sqlUpdate = "UPDATE user SET FirstName = ?, LastName = ?, Email = ?, Password = ?, User_Specialty_id = ?, User_Type_id = ?, User_Status_id = ?, User_Image = ?  WHERE id = ?";
    // req.file contains the uploaded image
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // First, check if the Password is empty or not provided in the request
        if (Password === '') {
            // If Password is empty, fetch the current password from the database and use it in the update query
            connection.query(sqlSelectPassword, [userId], (err, passwordResult) => {
                if (err) {
                    connection.release();
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                // Retrieve the current hashed password from the database
                const currentPassword = passwordResult[0].Password;
                // Check if userImage is empty or not provided in the request
                if (!req.file || !req.file.filename) {
                    // If userImage is empty, fetch the current User_Image from the database and use it in the update query
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        // Update the user without changing the password and userImage
                        connection.query(
                            sqlUpdate,
                            [FirstName, LastName, Email, currentPassword, User_Specialty_id, User_Type_id, User_Status_id, currentUserImage, userId],
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
                    // If userImage is provided and not empty, perform the update query as usual with the current password and new userImage
                    const userImage = req.file.filename;
                    connection.query(
                        sqlUpdate,
                        [FirstName, LastName, Email, currentPassword, User_Specialty_id, User_Type_id, User_Status_id, userImage, userId],
                        (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            // Update project folders here
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); // Delete individual file
                                });
                                const oldPath = req.file.path;
                                const Filename = req.file.filename;
                                const newPath = path.join(userFolderPath, Filename);
                                fs.renameSync(oldPath, newPath);
                                console.log(Filename)
                            }
                            res.send('Successfully updated!');
                            console.log(result);
                        }
                    );
                }
            });
        } else {
            // If Password is provided and not empty, hash the new password and perform the update query as usual
            bcrypt.hash(Password, saltRounds, (err, hash) => {
                if (err) {
                    connection.release();
                    console.log(err);
                    return;
                }
                // Check if userImage is empty or not provided in the request
                if (!req.file || !req.file.filename) {
                    // If userImage is empty, fetch the current User_Image from the database and use it in the update query
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        // Update the user with the new hashed password without changing the userImage
                        connection.query(
                            sqlUpdate,
                            [FirstName, LastName, Email, hash, User_Specialty_id, User_Type_id, User_Status_id, currentUserImage, userId],
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
                    // If userImage is provided and not empty, perform the update query as usual with the new hashed password and userImage
                    const userImage = req.file.filename;
                    connection.query(
                        sqlUpdate,
                        [FirstName, LastName, Email, hash, User_Specialty_id, User_Type_id, User_Status_id, userImage, userId],
                        (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            // Update project folders here
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); // Delete individual file
                                });
                                const oldPath = req.file.path;
                                const Filename = req.file.filename;
                                const newPath = path.join(userFolderPath, Filename);
                                fs.renameSync(oldPath, newPath);
                                console.log(Filename)
                            }
                            res.send('Successfully updated!');
                            console.log(result);
                        }
                    );
                }
            });
        }
    });
});

//for user edit form
app.put('/api/updateUser/:id', onlyTokenJWT, upload.single('userImage'), (req, res) => {
    const userId = req.params.id;
    const { FirstName, LastName, Email, Password, User_Specialty_id, User_Type_id, User_Status_id } = req.body;
    const sqlSelectPassword = "SELECT Password FROM user WHERE id = ?";
    const sqlSelectUserImage = "SELECT User_Image FROM user WHERE id = ?";
    const sqlUpdate = "UPDATE user SET FirstName = ?, LastName = ?, Email = ?, Password = ?, User_Specialty_id = ?, User_Type_id = ?, User_Status_id = ?, User_Image = ?  WHERE id = ?";
    // req.file contains the uploaded image
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // First, check if the Password is empty or not provided in the request
        if (Password === '') {
            // If Password is empty, fetch the current password from the database and use it in the update query
            connection.query(sqlSelectPassword, [userId], (err, passwordResult) => {
                if (err) {
                    connection.release();
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                // Retrieve the current hashed password from the database
                const currentPassword = passwordResult[0].Password;
                // Check if userImage is empty or not provided in the request
                if (!req.file || !req.file.filename) {
                    // If userImage is empty, fetch the current User_Image from the database and use it in the update query
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        // Update the user without changing the password and userImage
                        connection.query(
                            sqlUpdate,
                            [FirstName, LastName, Email, currentPassword, User_Specialty_id, User_Type_id, User_Status_id, currentUserImage, userId],
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
                    // If userImage is provided and not empty, perform the update query as usual with the current password and new userImage
                    const userImage = req.file.filename;
                    connection.query(
                        sqlUpdate,
                        [FirstName, LastName, Email, currentPassword, User_Specialty_id, User_Type_id, User_Status_id, userImage, userId],
                        (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            // Update project folders here
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); // Delete individual file
                                });
                                const oldPath = req.file.path;
                                const Filename = req.file.filename;
                                const newPath = path.join(userFolderPath, Filename);
                                fs.renameSync(oldPath, newPath);
                                console.log(Filename)
                            }
                            res.send('Successfully updated!');
                            console.log(result);
                        }
                    );
                }
            });
        } else {
            // If Password is provided and not empty, hash the new password and perform the update query as usual
            bcrypt.hash(Password, saltRounds, (err, hash) => {
                if (err) {
                    connection.release();
                    console.log(err);
                    return;
                }
                // Check if userImage is empty or not provided in the request
                if (!req.file || !req.file.filename) {
                    // If userImage is empty, fetch the current User_Image from the database and use it in the update query
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        // Update the user with the new hashed password without changing the userImage
                        connection.query(
                            sqlUpdate,
                            [FirstName, LastName, Email, hash, User_Specialty_id, User_Type_id, User_Status_id, currentUserImage, userId],
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
                    // If userImage is provided and not empty, perform the update query as usual with the new hashed password and userImage
                    const userImage = req.file.filename;
                    connection.query(
                        sqlUpdate,
                        [FirstName, LastName, Email, hash, User_Specialty_id, User_Type_id, User_Status_id, userImage, userId],
                        (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            // Update project folders here
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); // Delete individual file
                                });
                                const oldPath = req.file.path;
                                const Filename = req.file.filename;
                                const newPath = path.join(userFolderPath, Filename);
                                fs.renameSync(oldPath, newPath);
                                console.log(Filename)
                            }
                            res.send('Successfully updated!');
                            console.log(result);
                        }
                    );
                }
            });
        }
    });
});

//authentificaxiis cheki
app.get('/api/userauthent', verifyJWT, (req, res)=>{
    res.send('აუტენთიფიკაცია გავლილია წარმატებულად!');
});

//useris shenaxva
app.get('/api/login', (req, res)=>{
    if(req.session.user){
        res.send({
            loggedIn: true,
            user: req.session.user,
            token: req.session.token//aqedanac shevdzleb mivwvde tokens roca mWirdeba
        });
    } else{
        res.send({
            loggedIn: false
        });
    };
});

//login
app.post('/api/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
        db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const sqlSelect = "SELECT * FROM bms.user WHERE Email = ?;";
        connection.query(sqlSelect, email, (err, result) => {
        connection.release();
    
            if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).send('Internal Server Error');
            return;
            }
    
            if (result.length > 0) {
            bcrypt.compare(password, result[0].Password, (err, response) => {
                if (response) {
                const id = result[0].id;
                const userTypeId = result[0].User_Type_id;
                //console.log(userTypeId);
                const token = jwt.sign({ id, userTypeId }, "jwtSecret", {
                    // expiresIn: 86400,
                    expiresIn: oneDayInSeconds * 1000,
                });
                req.session.token = token;
                req.session.user = result;
                
                //console.log(req.session.user);
                res.json({ auth: true, token: token, result: result });
                } else {
                res.json({
                    auth: false,
                    message: "არასწორი პაროლი ან სახელი",
                });
                }
            });
            } else {
            res.json({
                auth: false,
                message: "მომხმარებელი ამ მონაცემებით არ არსებობს",
            });
            }
        });
        });
});

//logout
app.post('/api/logout', (req, res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.clearCookie('userid');
        res.json({ logout: true, message: 'Logged out successfully' });
    });
});



// for messages from projects
// Function to retrieve client mobile number
async function getClientMobile(clientId) {
    return new Promise((resolve, reject) => {
        const sqlSelectClientMobile = "SELECT Phone_Number FROM clients WHERE id = ?;";
        db.getConnection((err, connection) => {
            if (err) {
                reject(err);
                return;
            }
            
            connection.query(sqlSelectClientMobile, [clientId], (err, result) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }
                if (result.length > 0) {
                    resolve(result[0].Phone_Number);
                } else {
                    reject(new Error('Client not found'));
                }
            });
        });
    });
};

// Function to retrieve project name
async function getProjectName(projectId) {
    return new Promise((resolve, reject) => {
        const sqlSelectProjectName = "SELECT Project_Name FROM projects WHERE id = ?;";
        db.getConnection((err, connection) => {
            if (err) {
                reject(err);
                return;
            }
            
            connection.query(sqlSelectProjectName, [projectId], (err, result) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }
                if (result.length > 0) {
                    resolve(result[0].Project_Name);
                } else {
                    reject(new Error('Project not found'));
                }
            });
        });
    });
};

// Function to mark notification as sent
function markNotificationAsSent(projectId) {
    const sqlUpdateNotification = "UPDATE notification_queue_for_projects SET sent = 1 WHERE project_id = ?;";
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            return;
        }
        
        connection.query(sqlUpdateNotification, [projectId], (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                return;
            }
            console.log(`Notification for project ID ${projectId} marked as sent`);
        });
    });
};

async function sendPendingNotifications() {
    const sqlSelectPendingNotifications = "SELECT project_id, client_id FROM notification_queue_for_projects WHERE sent = 0;";
    // console.log('hi again projects 60 seconds gone');
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            return;
        }
        
        connection.query(sqlSelectPendingNotifications, (err, notifications) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                return;
            }
            
            notifications.forEach(async (notification) => {
                try {
                    const clientMobile = await getClientMobile(notification.client_id);
                    const projectName = await getProjectName(notification.project_id);
                    const sqlSelectClientFirstName = "SELECT Client_FirstName FROM clients WHERE id = ?;";
                    db.getConnection((err, connection) => {
                        if (err) {
                            console.error('Error getting MySQL connection:', err);
                            return;
                        }
                        
                        connection.query(sqlSelectClientFirstName, [notification.client_id], async (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                return;
                            }
                            
                            if (result.length > 0) {
                                const clientFirstName = result[0].Client_FirstName;
                                const message = `მოგესალმებით ბატონო ${clientFirstName}, თქვენს პროექტთან ${projectName} დაკავშირებული საბუთები მზად არის.`;
                                const companyName = 'tashub2023'
                                const url = `http://smsoffice.ge/api/v2/send/?key=fcc7acd7135b43a7b83273cc8f29da9a&destination=${clientMobile}&sender=${companyName}&content=${message}&urgent=true`;
                                try {
                                    const response = await axios.get(url);
                                    console.log('GET request successful', response.data);
                                    // Mark notification as sent in the notification_queue table
                                    markNotificationAsSent(notification.project_id);
                                } catch (error) {
                                    console.error('Error making GET request', error);
                                }
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error making GET request', error);
                }
            });
        });
    });
};

// Call the function at a suitable interval to send pending notifications
setInterval(sendPendingNotifications, 60000); // Every 60 seconds

// Function to retrieve service name
async function getServiceName(id) {
    return new Promise((resolve, reject) => {
        const sqlSelectServiceName = "SELECT Service_Name FROM services WHERE id = ?;";
        db.getConnection((err, connection) => {
            if (err) {
                reject(err);
                return;
            }
            
            connection.query(sqlSelectServiceName, [id], (err, result) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }
                if (result.length > 0) {
                    resolve(result[0].Service_Name);
                } else {
                    reject(new Error('Service not found'));
                }
            });
        });
    });
};

// Function to mark notification as sent
function markNotificationAsSentForServices(projectId) {
    const sqlUpdateNotificationForServices = "UPDATE notification_queue_for_services SET sent = 1 WHERE project_id = ?;";
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            return;
        }
        
        connection.query(sqlUpdateNotificationForServices, [projectId], (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                return;
            }
            console.log(`Notification for project ID ${projectId} marked as sent`);
        });
    });
};

async function sendPendingNotificationsForServices() {
    const sqlSelectPendingNotificationsForServices = "SELECT project_id, service_id, client_id FROM notification_queue_for_services WHERE sent = 0;";
    // console.log('hi again services 60 seconds gone');
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            return;
        }
        
        connection.query(sqlSelectPendingNotificationsForServices, (err, notifications) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                return;
            }
            
            notifications.forEach(async (notification) => {
                try {
                    const clientMobile = await getClientMobile(notification.client_id);
                    const projectName = await getProjectName(notification.project_id);
                    const serviceName = await getServiceName(notification.service_id);
                    var modifiedServiceName = serviceName.slice(0, -1) + 'ის';
                    const sqlSelectClientFirstName = "SELECT Client_FirstName FROM clients WHERE id = ?;";
                    db.getConnection((err, connection) => {
                        if (err) {
                            console.error('Error getting MySQL connection:', err);
                            return;
                        }
                        
                        connection.query(sqlSelectClientFirstName, [notification.client_id], async (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                return;
                            }
                            
                            if (result.length > 0) {
                                const clientFirstName = result[0].Client_FirstName;
                                const message = `მოგესალმებით ${clientFirstName}, თქვენს პროექტზე ${projectName} ${modifiedServiceName} ნაწილი მზად არის.`;
                                const companyName = 'tashub2023'
                                const url = `http://smsoffice.ge/api/v2/send/?key=fcc7acd7135b43a7b83273cc8f29da9a&destination=${clientMobile}&sender=${companyName}&content=${message}&urgent=true`;
                                try {
                                    const response = await axios.get(url);
                                    console.log('GET request successful', response.data);
                                    // Mark notification as sent in the notification_queue table
                                    markNotificationAsSentForServices(notification.project_id);
                                } catch (error) {
                                    console.error('Error making GET request', error);
                                }
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error making GET request', error);
                }
            });
        });
    });
};

// Call the function at a suitable interval to send pending notifications
setInterval(sendPendingNotificationsForServices, 60000); // Every 60 seconds


app.listen(3001, () => {//imistvis rom usafrtxod gaeshvas shignidan
    console.log('Running on port 3001');
});