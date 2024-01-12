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


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'bms',
});

const oneDayInSeconds = 86400;
app.use(cors({
    origin:  ["http://localhost:3000"],
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    key: "userid",
    secret: 'secr',
    resave:false,
    saveUninitialized: false,
    cookie: {
        maxAge: oneDayInSeconds * 1000, 
        secure: false, 
        httpOnly: true,
    }
}));
app.use(express.static('public'));

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


const upload = multer({ storage: storage,
	defParamCharset: 'utf8',
	defCharset: 'utf8',

});

db.getConnection((err, connection) => {
    if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
    }
    console.log('Connected to MySQL database!');
    connection.release();
});


const onlyTokenJWT = (req, res, next)=>{
    const token = req.headers["x-access-token"];
    
    if(!token){
        res.json({auth:false, message: "token-ის მიღება ვერ მოხერხდა"});
    } else{
        jwt.verify(token, "secretwordenw", (err, decoded)=>{
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
    
    if(!token){
        res.json({auth:false, message: "token-ის მიღება ვერ მოხერხდა"});
        
    } else{
        jwt.verify(token, "secretwordenw", (err, decoded)=>{
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


const clientsapi = require('./clientsAPI');
app.use('/api/clapi', verifyJWT, clientsapi(db, upload));


const projectsapi = require('./projectsAPI');
app.use('/api/projapi', projectsapi(db, upload));


const adminListAPI = require('./adminListAPI');
app.use('/api/adminapi', verifyJWT, adminListAPI(db));


app.get('/api/projapi/downloads/:projectId/:filename', (req, res) => {
    const filename  = req.params.filename;
    const projectId = req.params.projectId;
    const file = path.join(__dirname, 'public', 'uploads', 'projects', projectId, filename);
    res.download(file, filename);
});


app.get('/api/projapi/downloads/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    const projectFolderPath = path.join(__dirname, 'public', 'uploads', 'projects', projectId);
    const zipFileName = `project_${projectId}_files.zip`;
    
    const archive = archiver('zip', {
        zlib: { level: 9 } 
    });

    archive.pipe(res);

    fs.readdir(projectFolderPath, (err, files) => {
        if (err) {
            res.status(500).send('Error reading project folder.');
            return;
        }

        if (files.length === 0) {
            res.status(404).send('No files found in the project folder.');
            return;
        }

        files.forEach(file => {
            const filePath = path.join(projectFolderPath, file);
            archive.file(filePath, { name: file });
        });

        archive.finalize();
    });

    res.attachment(zipFileName);
});


app.get('/api/projapi/:projectId/files', (req, res) => {
    const projectId = req.params.projectId;
    const projectFolderPath = path.join(__dirname, 'public', 'uploads', 'projects', projectId);
    if (!fs.existsSync(projectFolderPath)) {
        return res.status(404).send('Project folder not found.');
    }
    fs.readdir(projectFolderPath, (err, files) => {
        if (err) {
        console.error('Error reading project folder:', err);
        return res.status(500).send('Internal Server Error');
        }
        res.json({ files });
    });
});


app.get('/api/projapi/:projectId/files/:fileName', (req, res) => {
    const projectId = req.params.projectId;
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'public', 'uploads', 'projects', projectId, fileName);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found.');
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.setHeader('Content-Disposition', contentDisposition(fileName));
        res.setHeader('Content-Length', data.length);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.end(data);
    });
});


app.delete('/api/projapi/delete/:projectId/:filename', (req, res) => {
    const encodedFilename = req.params.filename;
    const filename = decodeURIComponent(encodedFilename);
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
                connection.query(sqlSelectProjectDocs, [filename, projectId], (err, deleteResult) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    } else {
                        res.send('Filename' + ' ' + filename + ' ' + 'Successfully deleted!');
                        console.log(deleteResult);
                    }
                });
            });
        }
    });
});


app.get('/api/getUser', onlyTokenJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user;";
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
            res.json({auth:true, result: result});
        });
    });
});


app.get('/api/get', verifyJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user;";
    
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
            res.json({auth:true, result: result});
        });
    });
});


app.get('/api/getAdmins', verifyJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.user WHERE User_Type_id = 1;";
    
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
            res.json({auth:true, result: result});
        });
    });
});


app.get('/api/getShowHideRecs', onlyTokenJWT, (req, res) => {
    const sqlSelect = "SELECT * FROM bms.show_hide;";
    
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
            res.json({auth:true, result: result});
        });
    });
});



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


app.get('/api/get/specialty', (req, res) => {
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


app.get('/api/get/status', (req, res) => {
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


app.get('/api/get/type', (req, res) => {
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


app.post('/api/insert', verifyJWT, upload.single('userImage'), (req, res)=>{
    const Email = req.body.Email;
    const Password = req.body.Password;
    const FirstName = req.body.FirstName;
    const LastName = req.body.LastName;
    const userTypeId = req.body.userTypeId;
    const userSpecialtyId = req.body.userSpecialtyId;
    const userStatusId = req.body.userStatusId;
    
    let userImage = req.file;

    if(userImage === undefined){
        userImage = null;
    } else{
        userImage = req.file.filename;
    }

    
    bcrypt.hash(Password, saltRounds, (err, hash)=>{
        if(err){
            console.log(err);
        };
        const sqlInsert = "INSERT INTO user (FirstName, LastName, Email, Password, User_Specialty_id, User_Type_id, User_Status_id, User_Image) VALUES (?,?,?,?,?,?,?,?);";
       
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            connection.query(sqlInsert,[FirstName, LastName, Email, hash, userSpecialtyId, userTypeId, userStatusId, userImage], (err, result) => {
                
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


app.delete('/api/delete/:id', verifyJWT, (req,res)=>{
    const userId = req.params.id;
    const sqlDelete = 
    "DELETE FROM user WHERE id = ?;";
   
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        connection.query(sqlDelete, userId, (err, result) => {
           
            connection.release();
            if (err) {
                console.error('Error executing MySQL query:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userId.toString());
            if (fs.existsSync(userFolderPath)) {
                fs.readdirSync(userFolderPath).forEach((file) => {
                    const filePath = path.join(userFolderPath, file);
                    fs.unlinkSync(filePath); 
                });
                fs.rmdirSync(userFolderPath); 
            }
            res.json({deleted: true, message: 'Successfully deleted folder and record'});
            
            console.log(result);
        });
    });
});


app.put('/api/update/:id', verifyJWT, upload.single('userImage'), (req, res) => {
    const userId = req.params.id;
    const { FirstName, LastName, Email, Password, User_Specialty_id, User_Type_id, User_Status_id } = req.body;
    const sqlSelectPassword = "SELECT Password FROM user WHERE id = ?";
    const sqlSelectUserImage = "SELECT User_Image FROM user WHERE id = ?";
    const sqlUpdate = "UPDATE user SET FirstName = ?, LastName = ?, Email = ?, Password = ?, User_Specialty_id = ?, User_Type_id = ?, User_Status_id = ?, User_Image = ?  WHERE id = ?";
    
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        if (Password === '') {
            
            connection.query(sqlSelectPassword, [userId], (err, passwordResult) => {
                if (err) {
                    connection.release();
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                
                const currentPassword = passwordResult[0].Password;
                
                if (!req.file || !req.file.filename) {
                    
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        
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
                            
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); 
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
            
            bcrypt.hash(Password, saltRounds, (err, hash) => {
                if (err) {
                    connection.release();
                    console.log(err);
                    return;
                }
                
                if (!req.file || !req.file.filename) {
                    
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        
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
                            
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); 
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


app.put('/api/updateUser/:id', onlyTokenJWT, upload.single('userImage'), (req, res) => {
    const userId = req.params.id;
    const { FirstName, LastName, Email, Password, User_Specialty_id, User_Type_id, User_Status_id } = req.body;
    const sqlSelectPassword = "SELECT Password FROM user WHERE id = ?";
    const sqlSelectUserImage = "SELECT User_Image FROM user WHERE id = ?";
    const sqlUpdate = "UPDATE user SET FirstName = ?, LastName = ?, Email = ?, Password = ?, User_Specialty_id = ?, User_Type_id = ?, User_Status_id = ?, User_Image = ?  WHERE id = ?";
    
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        if (Password === '') {
            
            connection.query(sqlSelectPassword, [userId], (err, passwordResult) => {
                if (err) {
                    connection.release();
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                
                const currentPassword = passwordResult[0].Password;
                
                if (!req.file || !req.file.filename) {
                    
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        
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
                            
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); 
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
            
            bcrypt.hash(Password, saltRounds, (err, hash) => {
                if (err) {
                    connection.release();
                    console.log(err);
                    return;
                }
                
                if (!req.file || !req.file.filename) {
                    
                    connection.query(sqlSelectUserImage, [userId], (err, userImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentUserImage = userImageResult[0].User_Image;
                        
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
                            
                            const userIdfolder = userId;
                            const userFolderPath = path.join(__dirname, 'public', 'uploads', 'users', userIdfolder.toString());
                            if(fs.existsSync(userFolderPath)) {
                                fs.readdirSync(userFolderPath).forEach((file) => {
                                    const filePath = path.join(userFolderPath, file);
                                    fs.unlinkSync(filePath); 
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


app.get('/api/userauthent', verifyJWT, (req, res)=>{
    res.send('აუტენთიფიკაცია გავლილია წარმატებულად!');
});


app.get('/api/login', (req, res)=>{
    if(req.session.user){
        res.send({
            loggedIn: true,
            user: req.session.user,
            token: req.session.token
        });
    } else{
        res.send({
            loggedIn: false
        });
    };
});


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
                
                const token = jwt.sign({ id, userTypeId }, "secretwordenw", {
                    
                    expiresIn: oneDayInSeconds * 1000,
                });
                req.session.token = token;
                req.session.user = result;
                
                
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
                                const companyName = 'companyNameb2023'
                                const url = `http://localhost:3000`
                                try {
                                    const response = await axios.get(url);
                                    console.log('GET request successful', response.data);
                                    
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


setInterval(sendPendingNotifications, 60000); 


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
                                const companyName = 'companyNameb2023'
                                const url = `http://localhost:3000`
                                try {
                                    const response = await axios.get(url);
                                    console.log('GET request successful', response.data);
                                    
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


setInterval(sendPendingNotificationsForServices, 60000); 


app.listen(3001, () => {
    console.log('Running on port 3001');
});