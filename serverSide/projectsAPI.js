const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');


module.exports = (db, upload) => { // Accept the db object as a parameter
    //subservices
    router.get('/get/subservices', (req, res) => {
        const sqlSelect = "SELECT * FROM subservices;";
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

    //subservice statuses
    router.get('/get/subservicestat', (req, res) => {
        const sqlSelect = "SELECT * FROM subservice_statuses;";
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

    //projects to users
    router.get('/get/projectToUsers', (req, res) => {
        const sqlSelect = "SELECT * FROM project_to_users;";
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

    //services to project
    router.get('/get/servicesToProject', (req, res) => {
        const sqlSelect = "SELECT * FROM services_to_project;";
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

    //projects names
    router.get('/get/projectsNames', (req, res) => {
        const sqlSelectProjects = "SELECT Project_Name FROM bms.projects;";
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).json({ auth: false, message: 'Internal Server Error' });
                return;
            }
            connection.query(sqlSelectProjects, (err, projects) => {
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    connection.release();
                    res.status(500).json({ auth: false, message: 'Internal Server Error' });
                    return;
                }
                res.json({ auth: true, result: projects });
            });
        });
    });

    //projects codes
    router.get('/get/projectsCodes', (req, res) => {
        const sqlSelectProjects = "SELECT Project_Code FROM bms.projects;";
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).json({ auth: false, message: 'Internal Server Error' });
                return;
            }
            connection.query(sqlSelectProjects, (err, projects) => {
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    connection.release();
                    res.status(500).json({ auth: false, message: 'Internal Server Error' });
                    return;
                }
                res.json({ auth: true, result: projects });
            });
        });
    });

    //projects
    router.get('/get/projects', (req, res) => {
        const sqlSelectProjects = "SELECT * FROM bms.projects;";
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).json({ auth: false, message: 'Internal Server Error' });
                return;
            }
            connection.query(sqlSelectProjects, (err, projects) => {
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).json({ auth: false, message: 'Internal Server Error' });
                    connection.release();
                    return;
                }
                // Now fetch the list of assigned users for each project
                const projectIds = projects.map((project) => project.id);
                if (projectIds.length === 0) {
                    // Handle the case where there are no projects
                    res.json({ auth: true, result: [] });
                    connection.release();
                    return;
                }
    
                const sqlSelectAssignedUsers = `
                    SELECT pu.projectId, GROUP_CONCAT(CONCAT(u.id, ':', u.FirstName, ' ', u.LastName)) AS AssignedUsers
                    FROM bms.project_to_users AS pu
                    INNER JOIN bms.user AS u ON pu.userId = u.id
                    WHERE pu.projectId IN (${projectIds.join(',')})
                    GROUP BY pu.projectId;
                `;
    
                const sqlSelectProjectToUsers = `
                    SELECT * FROM bms.project_to_users WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectServicesToProject = `
                SELECT * FROM bms.services_to_project WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectDocsToUser = `
                SELECT * FROM bms.docs_to_user WHERE projectId IN (${projectIds.join(',')});
                `;
    
                const sqlSelectAssignedServices = `
                    SELECT sp.projectId, GROUP_CONCAT(CONCAT(s.id, ':', s.Service_Name)) AS AssignedServices
                    FROM bms.services_to_project AS sp
                    INNER JOIN bms.services AS s ON sp.serviceId = s.id
                    WHERE sp.projectId IN (${projectIds.join(',')})
                    GROUP BY sp.projectId;
                `;
    
                // Execute the first query to get assigned users
                connection.query(sqlSelectAssignedUsers, (err, assignedUsersResult) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).json({ auth: false, message: 'Internal Server Error' });
                        connection.release();
                        return;
                    }
    
                    // Execute the second query to get project_to_users data
                    connection.query(sqlSelectProjectToUsers, (err, projectToUsersResult) => {
                        if (err) {
                            console.error('Error executing MySQL query:', err);
                            res.status(500).json({ auth: false, message: 'Internal Server Error' });
                            connection.release();
                            return;
                        }
    
                        // Execute the third query to get assigned services
                        connection.query(sqlSelectAssignedServices, (err, assignedServicesResult) => {
                            //connection.release();
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                res.status(500).json({ auth: false, message: 'Internal Server Error' });
                                return;
                            }
                            connection.query(sqlSelectServicesToProject, (err, servicestoprojectResult) => {
                                // connection.release();
                                if (err) {
                                    console.error('Error executing MySQL query:', err);
                                    res.status(500).json({ auth: false, message: 'Internal Server Error' });
                                    return;
                                }
                                connection.query(sqlSelectDocsToUser, (err, docsToUserResult) => {
                                    connection.release();
                                    if (err) {
                                        console.error('Error executing MySQL query:', err);
                                        res.status(500).json({ auth: false, message: 'Internal Server Error' });
                                        return;
                                    }
                                    // Process assigned users and services data
                                    const projectsWithAssignedData = projects.map((project) => {
                                        const assignedUsersData = assignedUsersResult.find((item) => item.projectId === project.id);
                                        const assignedUsers = assignedUsersData ? assignedUsersData.AssignedUsers.split(',') : [];
            
                                        const projectToUsersData = projectToUsersResult.filter((item) => item.projectId === project.id);
                                        
                                        const servicesToProjectData = servicestoprojectResult.filter((item) => item.projectId === project.id);

                                        const docsToUserData = docsToUserResult.filter((item) => item.projectId === project.id);
            
                                        const assignedServicesData = assignedServicesResult.find((item) => item.projectId === project.id);
                                        const assignedServices = assignedServicesData ? assignedServicesData.AssignedServices.split(',') : [];
            
                                        // Convert the AssignedUsers string array into an array of objects (same as before)
                                        const assignedUsersArray = assignedUsers.map((userString) => {
                                            const [id, name] = userString.split(':');
                                            const [firstName, lastName] = name.split(' ');
                                            return { id: parseInt(id), FirstName: firstName, LastName: lastName };
                                        });
            
                                        // Convert the AssignedServices string array into an array of objects
                                        const assignedServicesArray = assignedServices.map((serviceString) => {
                                            const [id, Service_Name] = serviceString.split(':');
                                            return { id: parseInt(id), Service_Name: Service_Name };
                                        });
            
                                        return { ...project, assignedUsers: assignedUsersArray, 
                                            projectToUsers: projectToUsersData, 
                                            assignedServices: assignedServicesArray, 
                                            servicesToProjects: servicesToProjectData, 
                                            docsToUser: docsToUserData,
                                        };
                                    });
            
                                    res.json({ auth: true, result: projectsWithAssignedData });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    //projects by user id
    router.get('/get/userProjects/:id', (req, res) => {
        const userId = req.params.id === 'noID' ? '' : req.params.id;
        const sqlSelectProjects = `
            SELECT p.*, GROUP_CONCAT(CONCAT(u.id, ':', u.FirstName, ' ', u.LastName)) AS AssignedUsers
            FROM bms.projects AS p
            INNER JOIN bms.project_to_users AS pu ON p.id = pu.projectId
            INNER JOIN bms.user AS u ON pu.userId = u.id
            WHERE pu.userId = ?
            GROUP BY p.id;
        `;
    
        /*Use the getConnection method to retrieve a connection from the pool*/
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            // Perform the first query to get projects of the user
            connection.query(sqlSelectProjects, userId, (err, projectsResult) => {
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    connection.release();
                    res.status(500).send('Internal Server Error');
                    return;
                }
    
                if (projectsResult.length < 1) {
                    res.json({ auth: true, selected: false, result: [], message: 'Records not found' });
                    connection.release();
                    return;
                }
    
                const projectIds = projectsResult.map((project) => project.id);
    
                // Perform additional queries to retrieve data for each project
                const sqlSelectAssignedUsers = `
                    SELECT pu.projectId, GROUP_CONCAT(CONCAT(u.id, ':', u.FirstName, ' ', u.LastName)) AS AssignedUsers
                    FROM bms.project_to_users AS pu
                    INNER JOIN bms.user AS u ON pu.userId = u.id
                    WHERE pu.projectId IN (${projectIds.join(',')})
                    GROUP BY pu.projectId;
                `;
    
                // Add your other queries here
                const sqlSelectProjectToUsers = `
                SELECT * FROM bms.project_to_users WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectServicesToProject = `
                SELECT * FROM bms.services_to_project WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectDocsToUser = `
                SELECT * FROM bms.docs_to_user WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectAssignedServices = `
                    SELECT sp.projectId, GROUP_CONCAT(CONCAT(s.id, ':', s.Service_Name)) AS AssignedServices
                    FROM bms.services_to_project AS sp
                    INNER JOIN bms.services AS s ON sp.serviceId = s.id
                    WHERE sp.projectId IN (${projectIds.join(',')})
                    GROUP BY sp.projectId;
                `;
    
                // Execute the queries
                connection.query(sqlSelectAssignedUsers, (err, assignedUsersResult) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        connection.release();
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    connection.query(sqlSelectProjectToUsers, (err, projectToUsersResult) => {
                        if (err) {
                            console.error('Error executing MySQL query:', err);
                            connection.release();
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        connection.query(sqlSelectAssignedServices, (err, assignedServicesResult) => {
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                connection.release();
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            connection.query(sqlSelectServicesToProject, (err, servicestoprojectResult) => {
                                if (err) {
                                    console.error('Error executing MySQL query:', err);
                                    connection.release();
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }
                                connection.query(sqlSelectDocsToUser, (err, docsToUserResult) => {
                                    // connection.release();
                                    if (err) {
                                        console.error('Error executing MySQL query:', err);
                                        res.status(500).json({ auth: false, message: 'Internal Server Error' });
                                        return;
                                    }
                                    // Process assigned users and services data
                                    const projectsWithAssignedData = projectsResult.map((project) => {
                                        const assignedUsersData = assignedUsersResult.find((item) => item.projectId === project.id);
                                        const assignedUsers = assignedUsersData ? assignedUsersData.AssignedUsers.split(',') : [];
            
                                        const projectToUsersData = projectToUsersResult.filter((item) => item.projectId === project.id);
                                        
                                        const servicesToProjectData = servicestoprojectResult.filter((item) => item.projectId === project.id);

                                        const docsToUserData = docsToUserResult.filter((item) => item.projectId === project.id);
            
                                        const assignedServicesData = assignedServicesResult.find((item) => item.projectId === project.id);
                                        const assignedServices = assignedServicesData ? assignedServicesData.AssignedServices.split(',') : [];
            
                                        // Convert the AssignedUsers string array into an array of objects (same as before)
                                        const assignedUsersArray = assignedUsers.map((userString) => {
                                            const [id, name] = userString.split(':');
                                            const [firstName, lastName] = name.split(' ');
                                            return { id: parseInt(id), FirstName: firstName, LastName: lastName };
                                        });
            
                                        // Convert the AssignedServices string array into an array of objects
                                        const assignedServicesArray = assignedServices.map((serviceString) => {
                                            const [id, Service_Name] = serviceString.split(':');
                                            return { id: parseInt(id), Service_Name: Service_Name };
                                        });
            
                                        return { ...project, assignedUsers: assignedUsersArray, 
                                            projectToUsers: projectToUsersData, 
                                            assignedServices: assignedServicesArray, 
                                            servicesToProjects: servicesToProjectData,
                                            docsToUser: docsToUserData,
                                        };
                                    });
                                    res.json({ auth: true, selected: true, result: projectsWithAssignedData, message: 'Records are found' });
                                    connection.release()
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    

    //projects by client id
    router.get('/get/projects/:id', (req, res) => {
        const clientId = req.params.id === 'noID' ? '' : req.params.id;
        const sqlSelectProjects = "SELECT * FROM bms.projects WHERE Client_Id = ?;";
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            connection.query(sqlSelectProjects, clientId, (err, projects) => {
                if (err) {
                    console.error('Error executing MySQL query:', err);
                    res.status(500).send('Internal Server Error');
                    connection.release();
                    return;
                }
    
                // If no projects found, return "No records found" message directly
                if (projects.length === 0) {
                    res.json({ auth: true, selected: false, result: [], message: 'No records found' });
                    connection.release();
                    return;
                }
    
                // Now fetch the list of assigned users for each project
                const projectIds = projects.map((project) => project.id);
                const sqlSelectAssignedUsers = `
                    SELECT pu.projectId, GROUP_CONCAT(CONCAT(u.id, ':', u.FirstName, ' ', u.LastName)) AS AssignedUsers
                    FROM bms.project_to_users AS pu
                    INNER JOIN bms.user AS u ON pu.userId = u.id
                    WHERE pu.projectId IN (${projectIds.join(',')})
                    GROUP BY pu.projectId;
                `;
                // Add your other queries here
                const sqlSelectProjectToUsers = `
                SELECT * FROM bms.project_to_users WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectServicesToProject = `
                SELECT * FROM bms.services_to_project WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectDocsToUser = `
                SELECT * FROM bms.docs_to_user WHERE projectId IN (${projectIds.join(',')});
                `;

                const sqlSelectAssignedServices = `
                    SELECT sp.projectId, GROUP_CONCAT(CONCAT(s.id, ':', s.Service_Name)) AS AssignedServices
                    FROM bms.services_to_project AS sp
                    INNER JOIN bms.services AS s ON sp.serviceId = s.id
                    WHERE sp.projectId IN (${projectIds.join(',')})
                    GROUP BY sp.projectId;
                `;
    
                connection.query(sqlSelectAssignedUsers, (err, assignedUsersResult) => {
                    // connection.release();
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    
                    connection.query(sqlSelectProjectToUsers, (err, projectToUsersResult) => {
                        if (err) {
                            console.error('Error executing MySQL query:', err);
                            connection.release();
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        connection.query(sqlSelectAssignedServices, (err, assignedServicesResult) => {
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                connection.release();
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            connection.query(sqlSelectServicesToProject, (err, servicestoprojectResult) => {
                                if (err) {
                                    console.error('Error executing MySQL query:', err);
                                    connection.release();
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }
                                connection.query(sqlSelectDocsToUser, (err, docsToUserResult) => {
                                    // connection.release();
                                    if (err) {
                                        console.error('Error executing MySQL query:', err);
                                        res.status(500).json({ auth: false, message: 'Internal Server Error' });
                                        return;
                                    }
                                    // Merge the assigned users data with the projects data
                                    const projectsWithAssignedData = projects.map((project) => {
                                        const assignedUsersData = assignedUsersResult.find((item) => item.projectId === project.id);
                                        const assignedUsers = assignedUsersData ? assignedUsersData.AssignedUsers.split(',') : [];
                                        
                                        const projectToUsersData = projectToUsersResult.filter((item) => item.projectId === project.id);
                                        
                                        const servicesToProjectData = servicestoprojectResult.filter((item) => item.projectId === project.id);

                                        const docsToUserData = docsToUserResult.filter((item) => item.projectId === project.id);

                                        const assignedServicesData = assignedServicesResult.find((item) => item.projectId === project.id);
                                        const assignedServices = assignedServicesData ? assignedServicesData.AssignedServices.split(',') : [];

                                        // Convert the AssignedUsers string array into an array of objects
                                        const assignedUsersArray = assignedUsers.map((userString) => {
                                            const [id, name] = userString.split(':');
                                            const [firstName, lastName] = name.split(' ');
                                            return { id: parseInt(id), FirstName: firstName, LastName: lastName };
                                        });

                                        // Convert the AssignedServices string array into an array of objects
                                        const assignedServicesArray = assignedServices.map((serviceString) => {
                                            const [id, Service_Name] = serviceString.split(':');
                                            return { id: parseInt(id), Service_Name: Service_Name };
                                        });

                                        return { ...project, assignedUsers: assignedUsersArray, 
                                            projectToUsers: projectToUsersData, 
                                            assignedServices: assignedServicesArray, 
                                            servicesToProjects: servicesToProjectData,
                                            docsToUser: docsToUserData,
                                        };
                                    });
                    
                                    res.json({ auth: true, selected: true, result: projectsWithAssignedData, message: 'Records are found' });
                                    connection.release()
                                });
                            }); 
                        }); 
                    });
                });
            });
        });
    });    

    //status
    router.get('/get/projectStatus', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.project_status;";
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

    //pay status
    router.get('/get/payStatus', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.pay_status;";
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

    //valute
    router.get('/get/projectCurrency', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.currency;";
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

    //users id, firstname and lastname
    router.get('/get/projectUsers', (req, res) => {
        const sqlSelect = "SELECT id, FirstName, LastName FROM bms.user;";
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

    //clients id, firstname and lastname
    router.get('/get/projectClients', (req, res) => {
        const sqlSelect = "SELECT id, Client_FirstName, Client_LastName FROM bms.clients;";
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
    
    //types
    router.get('/get/projectType', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.project_types;";
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

    //services
    router.get('/get/services', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.services;";
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

    //pay status
    router.get('/get/payStatus', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.pay_status;";
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

    //service status
    router.get('/get/serviceStatus', (req, res) => {
        const sqlSelect = "SELECT * FROM bms.service_status;";
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

    // Get notifications for a user
    router.get('/get/notifications/:userId', (req, res) => {
        const userId = req.params.userId;
        const getFromNotificationsForUsers = 'SELECT * FROM notifications_for_users WHERE user_id = ? ORDER BY created_at DESC';
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Perform the query using the acquired connection
            connection.query(getFromNotificationsForUsers, userId, (err, result) => {
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

    //change user notification api
    router.put('/notifications/update/:id', (req, res) => {
        const Id = req.params.id;
        const sqlNotificationsUpdate = "UPDATE notifications_for_users SET `read` = 1 WHERE id = ?";
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error establishing database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Logic to handle the update      
            connection.query(
                sqlNotificationsUpdate,
                [Id],
                (err, result) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    connection.release();
                    res.send('Notification successfully updated!');
                    console.log(result);
            });
        });
    });

    //change specific user's all notifications
    router.put('/notifications/user/update/:uid', (req, res) => {
        const uid = req.params.uid;
        console.log(uid);
        const sqlNotificationsUpdate = "UPDATE notifications_for_users SET `read` = 1 WHERE user_id = ?";
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error establishing database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Logic to handle the update      
            connection.query(
                sqlNotificationsUpdate,
                [uid],
                (err, result) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    connection.release();
                    res.send('Notification successfully updated!');
                    console.log(result);
            });
        });
    });

    // Get admin notifications 
    router.get('/get/adminNotifications/:adminId', (req, res) => {
        const adminId = req.params.adminId;
        // console.log(adminId)
        const getNotifications = 'SELECT * FROM notifications_for_admin WHERE admin_id = ? ORDER BY created_at DESC';
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Perform the query using the acquired connection
            connection.query(getNotifications, adminId, (err, result) => {
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

    //change admin notifications api
    router.put('/adminNotifications/update/:id', (req, res) => {
        const Id = req.params.id;
        const sqlAdminNotificationsUpdate = "UPDATE notifications_for_admin SET `read` = 1 WHERE id = ?";
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error establishing database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Logic to handle the update      
            connection.query(
                sqlAdminNotificationsUpdate,
                [Id],
                (err, result) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    connection.release();
                    res.send('Notification successfully updated!');
                    console.log(result);
            });
        });
    });

    //change specific admin's all notifications api
    router.put('/adminNotifications/admin/update/:uid', (req, res) => {
        const uid = req.params.uid;
        const sqlAdminNotificationsUpdate = "UPDATE notifications_for_admin SET `read` = 1 WHERE admin_id = ?";
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error establishing database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Logic to handle the update      
            connection.query(
                sqlAdminNotificationsUpdate,
                [uid],
                (err, result) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    connection.release();
                    res.send('Notification successfully updated!');
                    console.log(result);
            });
        });
    });

    //delete api
    router.delete('/projects/delete/:id', (req, res) => {
        const projectId = req.params.id;
        const sqlDelete = "DELETE FROM projects WHERE id = ?;";
    
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
    
                // Delete the associated folder and files
                const projectFolderPath = path.join(__dirname, 'public', 'uploads', 'projects', projectId.toString());
                if (fs.existsSync(projectFolderPath)) {
                    fs.readdirSync(projectFolderPath).forEach((file) => {
                        const filePath = path.join(projectFolderPath, file);
                        fs.unlinkSync(filePath); // Delete individual file
                    });
                    fs.rmdirSync(projectFolderPath); // Delete the folder
                }
    
                res.json({ deleted: true, message: 'Successfully deleted folder and record' });
                console.log(result);
            });
        });
    });

    //insert api
    router.post('/projects/insert', upload.array('uploads'), (req, res) => {
        const subServices = req.body.subServices.map(jsonString => JSON.parse(jsonString));
        let initialServices = req.body.Services;
        let services;
        if(typeof initialServices === "string"){
            services = JSON.parse(initialServices);
        } else{
            services = initialServices.map(jsonString => JSON.parse(jsonString));
        }
        // console.log(req.body)
        const clientId = req.body.clientId;
        const projectTypeId = req.body.projectTypeId;
        const projectName = req.body.projectName;
        const projectCode = req.body.projectCode;
        const projectStatusId = req.body.projectStatusId;
        const projectPrice = req.body.projectPrice;
        const payStatusId = req.body.payStatusId;
        const collectedServiceStatusIds = JSON.parse(req.body.collectedServiceStatusIds);
        const initialCollectedSubServiceStatusIds = JSON.parse(req.body.collectedSubServiceStatusIds);
        const initialCollectedSubServiceUserIds = JSON.parse(req.body.collectedSubServiceUserIds);
        const initialCollectedSubServiceDates = JSON.parse(req.body.collectedSubServiceDates);
        const collectedSubServiceStatusIds = {};
        const collectedSubServiceIds = {};
        const collectedSubServiceUserIds = {};
        const collectedSubServiceMainDate = {};
        const collectedSubServiceMayorDate = {};
        for (const key in initialCollectedSubServiceStatusIds) {
            if (initialCollectedSubServiceStatusIds.hasOwnProperty(key)) {
                const subServices = initialCollectedSubServiceStatusIds[key];
                const subServiceIds = subServices.map(subService => subService.subServiceId);
                collectedSubServiceIds[key] = subServiceIds;
            }
        }
        for (const key in initialCollectedSubServiceStatusIds) {
            if (initialCollectedSubServiceStatusIds.hasOwnProperty(key)) {
                const subServices = initialCollectedSubServiceStatusIds[key];
                const subServiceStatusIds = subServices.map(subService => subService.subServiceStatusId);
                collectedSubServiceStatusIds[key] = subServiceStatusIds;
            }
        }
        for (const key in initialCollectedSubServiceUserIds) {
            if (initialCollectedSubServiceUserIds.hasOwnProperty(key)) {
                const subServices = initialCollectedSubServiceUserIds[key];
                const subServiceUserIds = subServices.map(subService => subService.selectedUsers);
                collectedSubServiceUserIds[key] = subServiceUserIds;
            }
        }
        for (const key in initialCollectedSubServiceDates) {
            if (initialCollectedSubServiceDates.hasOwnProperty(key)) {
                const subServices = initialCollectedSubServiceDates[key];
                const subServiceMainDate = subServices.map(subService => subService.mainDate);
                collectedSubServiceMainDate[key] = subServiceMainDate;
            }
        }
        for (const key in initialCollectedSubServiceDates) {
            if (initialCollectedSubServiceDates.hasOwnProperty(key)) {
                const subServices = initialCollectedSubServiceDates[key];
                const subServiceMayorDate = subServices.map(subService => subService.mayorDate);
                collectedSubServiceMayorDate[key] = subServiceMayorDate;
            }
        }
        const paidAmount = req.body.paidAmount;
        const currencyId = req.body.currencyId;
        const currencyRate = req.body.currencyRate;
        const userIds = req.body.userIds; 
        const userDates = JSON.parse(req.body.userDates);
        const serviceIds = req.body.serviceIds;
        const serviceDates = JSON.parse(req.body.serviceDates);
        const serviceMayorDates = JSON.parse(req.body.serviceMayorDates);
        const docsToUser = JSON.parse(req.body.docsToUser);
        let servicesData = [];
        let projectDocs = req.files;  

        if (Array.isArray(serviceIds)) {
            servicesData = serviceIds.map(serviceId => [null, serviceId]);// Since projectId is not yet available
        }else{
            servicesData = [[null, serviceIds]];
        }

        const sqlInsertServicesToProject = "INSERT INTO services_to_project (projectId, serviceId, clientId, deadLine, mayorDeadLine, Service_Status_Id, userIds, subservice_id, subservice_status_id, subservice_userIds, subservice_deadLine, subservice_mayorDeadLine) VALUES ?;";

        const sqlInsertDocsToUser = "INSERT INTO docs_to_user (projectId, userId, fileNames) VALUES (?, ?, ?);";

        if (typeof projectDocs === 'object') {
            if (Object.keys(projectDocs).length === 0) {
                projectDocs = null;
            } else {
                projectDocs = req.files.map((file) => file.filename); 
            }
        } else {
            console.log('projectDocs is ' + typeof(projectDocs));
        }
    
        const sqlInsertProject = "INSERT INTO projects (Client_Id, Project_Type_ID, Project_Name, Project_Code, Project_Status_ID, Project_Price, Pay_Status_ID, Paid_Amount, Currency_ID, Currency_Rate, Project_Docs) VALUES (?,?,?,?,?,?,?,?,?,?,?);";
    
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            connection.beginTransaction((err) => {
                if (err) {
                    console.error('Error starting transaction:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
    
                connection.query(sqlInsertProject, [clientId, projectTypeId, projectName, projectCode, projectStatusId, projectPrice, payStatusId, paidAmount, currencyId, currencyRate, projectDocs ? projectDocs.join(', ') : null], (err, result) => {
                    if (err) {
                        console.error('Error executing MySQL query:', err);
                        connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Internal Server Error');
                        });
                        return;
                    }
    
                    const projectId = result.insertId; 
                    const projectIdfolder = result.insertId;
                    const projectFolderPath = path.join(__dirname, 'public', 'uploads', 'projects', projectIdfolder.toString());
                    if (!fs.existsSync(projectFolderPath)) {
                        fs.mkdirSync(projectFolderPath);
                    }
                    if(projectDocs){
                        req.files.forEach((file) => {
                            const oldPath = file.path;
                            const Filename = file.filename;
                            const newPath = path.join(projectFolderPath, Filename);
                            fs.renameSync(oldPath, newPath);
                            console.log(Filename)
                        });
                    }
    
                    const sqlInsertProjectUsers = "INSERT INTO project_to_users (projectId, userId, deadLine) VALUES ?;";
                    const uniqueUserIds = [...new Set(userIds)];
                    const projectUserData = userIds === undefined
                    ? [[projectId, null, userDates[null] || null]]
                    : typeof(userIds) === 'string'
                    ? [[projectId, userIds, userDates[userIds] || null]]
                    : uniqueUserIds.map(userId => [projectId, userId, userDates[userId] || null]);
                    connection.query(sqlInsertProjectUsers, [projectUserData], (err, result) => {
                        if (err) {
                            console.error('Error executing MySQL query:', err);
                            connection.rollback(() => {
                                connection.release();
                                res.status(500).send('Internal Server Error');
                            });
                            return;
                        }
                        const sqlInsertNotifications = 'INSERT INTO notifications_for_users (user_id, project_id, message, `read`) VALUES  ?;';
                        const messageWithProjectName = `You are assigned to the project ${projectName}`;
                        const dataForNotifications = userIds === undefined 
                        ? [[null, projectId, messageWithProjectName, 0]]
                        : typeof(userIds) === 'string'
                        ? [[userIds, projectId, messageWithProjectName, 0]]
                        : uniqueUserIds.map(userId => [userId, projectId, messageWithProjectName, 0]);
                        connection.query(sqlInsertNotifications, [dataForNotifications], (err, notificationResult) => {
                            if (err) {
                                console.error('Error executing MySQL query:', err);
                                connection.rollback(() => {
                                    connection.release();
                                    res.status(500).send('Internal Server Error');
                                });
                                return;
                            }
                            connection.query(sqlInsertDocsToUser, [projectId, docsToUser.userId, docsToUser.fileNames.join(', ')], (err, docsToUserResult) => {
                                if (err) {
                                    console.error('Error executing MySQL query:', err);
                                    connection.rollback(() => {
                                        connection.release();
                                        res.status(500).send('Internal Server Error');
                                    });
                                    return;
                                }

                                const arrayOfUserIds = []; // Create an array to store user IDs for each service
                                if (servicesData.length > 0 || servicesData.length === 0) {
                                    if (servicesData.length === 0) {
                                        servicesData.push([projectId, null, clientId, null, null]); // Add a record with projectId and null serviceId
                                    } else {
                                        // Set projectId in servicesData
                                        servicesData.forEach(serviceData => {
                                            serviceData[0] = projectId;
                                            serviceData[2] = clientId;
                                            serviceData[3] = serviceDates[serviceData[1]] || null;
                                            serviceData[4] = serviceMayorDates[serviceData[1]] || null;
                                            serviceData[5] = collectedServiceStatusIds[serviceData[1]] || null;
                                            const userIdsKey = `userIds-${serviceData[1]}`;
                                            const userIdsString = req.body[userIdsKey];
                                            const userIdsArray = userIdsString ? JSON.parse(userIdsString) : []; // Parse only if data is provided
                                            const subServiceIds = collectedSubServiceIds[serviceData[1]] || [];
                                            const subServiceStatusIds = collectedSubServiceStatusIds[serviceData[1]] || [];
                                            const subServiceMayorDate = collectedSubServiceMayorDate[serviceData[1]] || [];
                                            const subServiceMainDate = collectedSubServiceMainDate[serviceData[1]] || [];
                                            const subServiceUserIds = collectedSubServiceUserIds[serviceData[1]] || [];
                                            const stringifiedSubServiceUserIds = subServiceUserIds.map(innerArray => JSON.stringify(innerArray));
                                            let subServiceData;
                                            if (subServiceIds.length > 0) {
                                                subServiceData = subServiceIds.map((subServiceId, index) => [
                                                    projectId, 
                                                    serviceData[1], 
                                                    serviceData[2], 
                                                    serviceData[3], 
                                                    serviceData[4], 
                                                    serviceData[5], 
                                                    JSON.stringify(userIdsArray), 
                                                    subServiceId, 
                                                    subServiceStatusIds[index],
                                                    stringifiedSubServiceUserIds[index],
                                                    subServiceMainDate[index],
                                                    subServiceMayorDate[index],
                                                ]);
                                            } else {
                                                callback(); // Move to the next iteration
                                            }
                                            arrayOfUserIds.push(...subServiceData.map(data => [
                                                projectId, 
                                                serviceData[1], 
                                                clientId, 
                                                data[3], 
                                                data[4], 
                                                data[5], 
                                                JSON.stringify(userIdsArray), 
                                                data[7],
                                                data[8],
                                                data[9],
                                                data[10],
                                                data[11],
                                            ])); // Store data for arrayOfUserIds
                                        });                            
                                    }
                                    // Insert the user IDs for each service into the services_to_project table
                                    connection.query(sqlInsertServicesToProject, [arrayOfUserIds], (err, userInsertResult) => {
                                        if (err) {
                                            console.error('Error inserting user IDs to services_to_project:', err);
                                        }
                                        connection.commit((err) => {
                                            if (err) {
                                                console.error('Error committing transaction:', err);
                                                connection.rollback(() => {
                                                    connection.release();
                                                    res.status(500).send('Internal Server Error');
                                                });
                                                return;
                                            }

                                            connection.release();
                                            res.send('Successfully added!');
                                            console.log(result);
                                        });
                                    });
                                } else {
                                    connection.commit((err) => {
                                        if (err) {
                                            console.error('Error committing transaction:', err);
                                            connection.rollback(() => {
                                                connection.release();
                                                res.status(500).send('Internal Server Error');
                                            });
                                            return;
                                        }
            
                                        connection.release();
                                        res.send('Successfully added!');
                                        console.log(result);
                                    });
                                }
                            });
                            
                        });
                    });
                });
            });
        });
    });

    //change api
    router.put('/projects/update/:id', upload.array('uploads'), (req, res) => {
        try{
            const projectId = req.params.id;
            const { clientId, projectTypeId, projectName, projectCode, projectStatusId, projectPrice, payStatusId, paidAmount, currencyId, currencyRate, userIds, serviceIds, currentUserId } = req.body;
            const userDates = JSON.parse(req.body.userDates);
            const serviceDates = JSON.parse(req.body.serviceDates);
            const serviceMayorDates = JSON.parse(req.body.serviceMayorDates);
            const collectedServiceStatusIds = JSON.parse(req.body.collectedServiceStatusIds);

            const initialCollectedSubServiceStatusIds = JSON.parse(req.body.collectedSubServiceStatusIds);
            const initialCollectedSubServiceUserIds = JSON.parse(req.body.collectedSubServiceUserIds);
            const initialCollectedSubServiceDates = JSON.parse(req.body.collectedSubServiceDates);
            const collectedSubServiceStatusIds = {};
            const collectedSubServiceIds = {};
            const collectedSubServiceUserIds = {};
            const collectedSubServiceMainDate = {};
            const collectedSubServiceMayorDate = {};
            for (const key in initialCollectedSubServiceStatusIds) {
                if (initialCollectedSubServiceStatusIds.hasOwnProperty(key)) {
                    const subServices = initialCollectedSubServiceStatusIds[key];
                    const subServiceIds = subServices.map(subService => subService.subServiceId);
                    collectedSubServiceIds[key] = subServiceIds;
                }
            }
            for (const key in initialCollectedSubServiceStatusIds) {
                if (initialCollectedSubServiceStatusIds.hasOwnProperty(key)) {
                    const subServices = initialCollectedSubServiceStatusIds[key];
                    const subServiceStatusIds = subServices.map(subService => subService.subServiceStatusId);
                    collectedSubServiceStatusIds[key] = subServiceStatusIds;
                }
            }
            for (const key in initialCollectedSubServiceUserIds) {
                if (initialCollectedSubServiceUserIds.hasOwnProperty(key)) {
                    const subServices = initialCollectedSubServiceUserIds[key];
                    const subServiceUserIds = subServices.map(subService => subService.selectedUsers);
                    collectedSubServiceUserIds[key] = subServiceUserIds;
                }
            }
            for (const key in initialCollectedSubServiceDates) {
                if (initialCollectedSubServiceDates.hasOwnProperty(key)) {
                    const subServices = initialCollectedSubServiceDates[key];
                    const subServiceMainDate = subServices.map(subService => subService.mainDate);
                    collectedSubServiceMainDate[key] = subServiceMainDate;
                }
            }
            for (const key in initialCollectedSubServiceDates) {
                if (initialCollectedSubServiceDates.hasOwnProperty(key)) {
                    const subServices = initialCollectedSubServiceDates[key];
                    const subServiceMayorDate = subServices.map(subService => subService.mayorDate);
                    collectedSubServiceMayorDate[key] = subServiceMayorDate;
                }
            }

            const docsToUser = JSON.parse(req.body.docsToUser);
            const messageBody = JSON.parse(req.body.messageBody);
            const sqlSelectProjectDocs = "SELECT Project_Docs FROM projects WHERE id = ?";
            const sqlUpdate = "UPDATE projects SET Client_Id = ?, Project_Type_ID = ?, Project_Name = ?, Project_Code = ?, Project_Status_ID = ?, Project_Price = ?, Pay_Status_ID = ?, Paid_Amount = ?, Currency_ID = ?, Currency_Rate = ?, Project_Docs = ? WHERE id = ?";
            const sqlDeleteProjectUsers = "DELETE FROM project_to_users WHERE projectId = ?";
            const sqlInsertProjectUsers = "INSERT INTO project_to_users (projectId, userId, deadLine) VALUES ?";
            const sqlDeleteServiceProjects = "DELETE FROM services_to_project WHERE projectId = ?";
            const sqlInsertServiceProjects = "INSERT INTO services_to_project (projectId, serviceId, clientId, deadLine, mayorDeadLine, Service_Status_Id, userIds, subservice_id, subservice_status_id, subservice_userIds, subservice_deadLine, subservice_mayorDeadLine) VALUES ?";
    
            const sqlInsertDocsToUser = "INSERT INTO docs_to_user (projectId, userId, fileNames) VALUES (?, ?, ?);";
            const sqlNotificationsInsert = "INSERT INTO notifications_for_users (user_id, project_id, message, `read`) VALUES ?;";
    
            let servicesData = [];
    
            if (Array.isArray(serviceIds)) {
                servicesData = serviceIds.map(serviceId => [null, serviceId]);// Since projectId is not yet available
            }else{
                servicesData = [[null, serviceIds]];
            }
        
            db.getConnection((err, connection) => {
                if (err) {
                    console.error('Error establishing database connection:', err);
                    connection.release();
                    res.status(500).send('Internal Server Error');
                    return;
                }
        
                const projectDocs = req.files.map(file => file.filename);
    
                // Logic to handle the update based on the number of files uploaded
                if (projectDocs.length === 0) {
                    connection.query(sqlSelectProjectDocs, [projectId], (err, projectImageResult) => {
                        if (err) {
                            connection.release();
                            console.error('Error executing MySQL query:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const currentProjectDocs = projectImageResult.map(result => result.Project_Docs);
                
                        connection.query(
                            sqlUpdate,
                            [clientId, projectTypeId, projectName, projectCode, projectStatusId, projectPrice, payStatusId, paidAmount, currencyId, currencyRate, currentProjectDocs, projectId],
                            (err, result) => {
                                if (err) {
                                    connection.release();
                                    console.error('Error executing MySQL query:', err);
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }
                                // Step 1: Delete all existing records with the specified project ID
                                connection.query(sqlDeleteProjectUsers, [projectId], (err, deleteResult) => {
                                    if (err) {
                                        connection.release();
                                        console.error('Error executing MySQL query:', err);
                                        res.status(500).send('Internal Server Error');
                                        return;
                                    }
                                    const messageMessage = messageBody.message;
                                    const messageUserIds = messageBody.userIds;
                                    const messageProjectId = messageBody.projectId;
                                    const messageProjectName = messageBody.projectName;
                                    const messageProjectCode = messageBody.projectCode;
                                    const uniqueUserIds = [...new Set(messageUserIds)];                        
                                    const messageWithProjectName = `In the project ${messageProjectName}: ${messageMessage}`;
                                    const dataForNotifications = messageUserIds === undefined || messageUserIds.length === 0
                                    ? [[null, messageProjectId, messageWithProjectName, 0]]  // Handle empty user IDs array
                                    : typeof(messageUserIds) === 'string'
                                    ? [[messageUserIds, messageProjectId, messageWithProjectName, 0]]
                                    : uniqueUserIds.map(userId => [userId, messageProjectId, messageWithProjectName, 0]);
                                    connection.query(sqlNotificationsInsert, [dataForNotifications], (err, notificationInsertResult) => {
                                        if (err) {
                                            console.error('Error executing MySQL query:', err);
                                            connection.release();
                                            res.status(500).send('Internal Server Error');
                                            return;
                                        }
                                        connection.query(sqlInsertDocsToUser, [docsToUser.projectId, docsToUser.userId, docsToUser.fileNames.join(', ')], (err, insertDocsToUserResult) => {
                                            if (err) {
                                                connection.release();
                                                console.error('Error executing MySQL query:', err);
                                                res.status(500).send('Internal Server Error');
                                                return;
                                            }
                                            // Step 2: Update filenames in the 'files' table
                                            const sqlUpdateFilenames = "UPDATE projects SET Project_Docs = REPLACE(REPLACE(Project_Docs, ' ', ''), ',', '') WHERE id = ?";
                                            connection.query(sqlUpdateFilenames, [projectId], (updateErr, updateResult) => {
                                                if (updateErr) {
                                                    connection.release();
                                                    console.error('Error updating filenames:', updateErr);
                                                    res.status(500).send('Internal Server Error');
                                                    return;
                                                }
                                                connection.query(sqlDeleteServiceProjects, [projectId], (err, deleteResult) => {
                                                    if (err) {
                                                        connection.release();
                                                        console.error('Error executing MySQL query:', err);
                                                        res.status(500).send('Internal Server Error');
                                                        return;
                                                    }
                                                    // Step 3: Insert new records with the new project ID and user IDs
                                                    const insertData = userIds === undefined
                                                    ? [[projectId, null, userDates[null] || null]]
                                                    : typeof(userIds) === 'string'
                                                    ? [[projectId, userIds, userDates[userIds] || null]]
                                                    : userIds.map(userId => [projectId, userId, userDates[userId] || null]);
                                                    connection.query(sqlInsertProjectUsers, [insertData], (err, insertResult) => {
                                                        if (err) {
                                                            console.error('Error executing MySQL query:', err);
                                                            res.status(500).send('Internal Server Error');
                                                            return;
                                                        }
                                                        console.log(result);
                                                        // Step 3: Insert new records with the new project ID and user IDs
                                                        const arrayOfUserIds = [];
                                                        if (servicesData.length > 0 || servicesData.length === 0) {
                                                            if (servicesData.length === 0) {
                                                                servicesData.push([projectId, null, clientId, null, null, null]); // Add a record with projectId and null serviceId
                                                            } else {
                                                                // Set projectId in servicesData
                                                                servicesData.forEach(serviceData => {
                                                                    serviceData[0] = projectId;
                                                                    serviceData[2] = clientId;
                                                                    serviceData[3] = serviceDates[serviceData[1]] || null;
                                                                    serviceData[4] = serviceMayorDates[serviceData[1]] || null;
                                                                    serviceData[5] = collectedServiceStatusIds[serviceData[1]] || null;
                                                                    // Check if the userIds data is provided before attempting to parse it
                                                                    const userIdsKey = `userIds-${serviceData[1]}`;
                                                                    const userIdsString = req.body[userIdsKey];
                                                                    const userIdsArray = userIdsString ? JSON.parse(userIdsString) : []; // Parse only if data is provided
                                                                    const subServiceIds = collectedSubServiceIds[serviceData[1]] || [];
                                                                    const subServiceStatusIds = collectedSubServiceStatusIds[serviceData[1]] || [];
                                                                    const subServiceMayorDate = collectedSubServiceMayorDate[serviceData[1]] || [];
                                                                    const subServiceMainDate = collectedSubServiceMainDate[serviceData[1]] || [];
                                                                    const subServiceUserIds = collectedSubServiceUserIds[serviceData[1]] || [];
                                                                    const stringifiedSubServiceUserIds = subServiceUserIds.map(innerArray => JSON.stringify(innerArray));
                                                                    let subServiceData;
                                                                    if (subServiceIds.length > 0) {
                                                                        subServiceData = subServiceIds.map((subServiceId, index) => [
                                                                            projectId, 
                                                                            serviceData[1], 
                                                                            serviceData[2], 
                                                                            serviceData[3], 
                                                                            serviceData[4], 
                                                                            serviceData[5], 
                                                                            JSON.stringify(userIdsArray), 
                                                                            subServiceId, 
                                                                            subServiceStatusIds[index],
                                                                            stringifiedSubServiceUserIds[index],
                                                                            subServiceMainDate[index],
                                                                            subServiceMayorDate[index],
                                                                        ]);
                                                                    } else {
                                                                        callback(); // Move to the next iteration
                                                                    }
                                                                    arrayOfUserIds.push(...subServiceData.map(data => [
                                                                        projectId, 
                                                                        serviceData[1], 
                                                                        clientId, 
                                                                        data[3], 
                                                                        data[4], 
                                                                        data[5], 
                                                                        JSON.stringify(userIdsArray), 
                                                                        data[7],
                                                                        data[8],
                                                                        data[9],
                                                                        data[10],
                                                                        data[11],
                                                                    ])); // Store data for arrayOfUserIds
                                                                });                            
                                                            }
                                                            // Use a Set to keep track of unique arrays
                                                            const uniqueArrays = new Set();
                                                            // Function to convert arrays to strings for easy comparison
                                                            const arrayToString = (arr) => JSON.stringify(arr);
                                                            // Filter out duplicates
                                                            const filteredArray = arrayOfUserIds.filter((arr) => {
                                                            const stringRepresentation = arrayToString(arr);
                                                            const isUnique = !uniqueArrays.has(stringRepresentation);
                                                            if (isUnique) {
                                                                uniqueArrays.add(stringRepresentation);
                                                            }
                                                            return isUnique;
                                                            });
                                                            // Insert the user IDs for each service into the services_to_project table
                                                            connection.query(sqlInsertServiceProjects, [filteredArray], (err, userInsertResult) => {
                                                                if (err) {
                                                                    console.error('Error inserting user IDs to services_to_project:', err);
                                                                }
                                                                connection.commit((err) => {
                                                                    if (err) {
                                                                        console.error('Error committing transaction:', err);
                                                                        connection.rollback(() => {
                                                                            connection.release();
                                                                            res.status(500).send('Internal Server Error');
                                                                        });
                                                                        return;
                                                                    }
                                    
                                                                    connection.release();
                                                                    res.send('Successfully added!');
                                                                    console.log(result);
                                                                });
                                                            });
                                                        } else {
                                                            connection.commit((err) => {
                                                                if (err) {
                                                                    console.error('Error committing transaction:', err);
                                                                    connection.rollback(() => {
                                                                        connection.release();
                                                                        res.status(500).send('Internal Server Error');
                                                                    });
                                                                    return;
                                                                }
                                    
                                                                connection.release();
                                                                res.send('Successfully added!');
                                                                console.log(result);
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    // });
                                    });
                                });
                            }
                        );
                    });
                } else {
                    // Assuming `projectDocs` is an array containing the filenames of all uploaded files.
                    const updatedProjectDocs = projectDocs.join(', '); // Concatenate filenames into a single string separated by commas
                    connection.query(
                        sqlUpdate,
                        [clientId, projectTypeId, projectName, projectCode, projectStatusId, projectPrice, payStatusId, paidAmount, currencyId, currencyRate, updatedProjectDocs, projectId],
                        (err, result) => {
                            if (err) {
                                connection.release();
                                console.error('Error executing MySQL query:', err);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            // Step 1: Delete all existing records with the specified project ID
                            connection.query(sqlDeleteProjectUsers, [projectId], (err, deleteProjectUsersResult) => {
                                if (err) {
                                    connection.release();
                                    console.error('Error executing MySQL query:', err);
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }
                                const messageMessage = messageBody.message;
                                const messageUserIds = messageBody.userIds;
                                const messageProjectId = messageBody.projectId;
                                const messageProjectName = messageBody.projectName;
                                const messageProjectCode = messageBody.projectCode;
                                const uniqueUserIds = [...new Set(messageUserIds)];                        
                                const messageWithProjectName = `In the project ${messageProjectName}: ${messageMessage}`;
                                const dataForNotifications = messageUserIds === undefined || messageUserIds.length === 0
                                ? [[null, messageProjectId, messageWithProjectName, 0]]  // Handle empty user IDs array
                                : typeof(messageUserIds) === 'string'
                                ? [[messageUserIds, messageProjectId, messageWithProjectName, 0]]
                                : uniqueUserIds.map(userId => [userId, messageProjectId, messageWithProjectName, 0]);
                                console.log(dataForNotifications)
                                connection.query(sqlNotificationsInsert, [dataForNotifications], (err, notificationInsertResult) => {
                                    if (err) {
                                        console.error('Error executing MySQL query:', err);
                                        connection.release();
                                        res.status(500).send('Internal Server Error');
                                        return;
                                    }
                                    connection.query(sqlInsertDocsToUser, [docsToUser.projectId, docsToUser.userId, docsToUser.fileNames.join(', ')], (err, insertDocsToUserResult) => {
                                        if (err) {
                                            connection.release();
                                            console.error('Error executing MySQL query:', err);
                                            res.status(500).send('Internal Server Error');
                                            return;
                                        }
                                        connection.query(sqlDeleteServiceProjects, [projectId], (err, deleteServiceProjectsResult) => {
                                            if (err) {
                                                connection.release();
                                                console.error('Error executing MySQL query:', err);
                                                res.status(500).send('Internal Server Error');
                                                return;
                                            }
                                            // Step 3: Insert new records with the new project ID and user IDs
                                            const insertData = userIds === undefined
                                            ? [[projectId, null, userDates[null] || null]]
                                            : typeof(userIds) === 'string'
                                            ? [[projectId, userIds, userDates[userIds] || null]]
                                            : userIds.map(userId => [projectId, userId, userDates[userId] || null]);
                                            connection.query(sqlInsertProjectUsers, [insertData], (err, insertProjectsUsersResult) => {
                                                if (err) {
                                                    console.error('Error executing MySQL query:', err);
                                                    res.status(500).send('Internal Server Error');
                                                    return;
                                                }
                                                // Update project folders here
                                                const projectIdfolder = projectId;
                                                const projectFolderPath = path.join(__dirname, 'public', 'uploads', 'projects', projectIdfolder.toString());
                                                if(fs.existsSync(projectFolderPath)) {
                                                    fs.readdirSync(projectFolderPath).forEach((file) => {
                                                        const filePath = path.join(projectFolderPath, file);
                                                        fs.unlinkSync(filePath); // Delete individual file
                                                    });
                                                    req.files.forEach((file) => {
                                                        const oldPath = file.path;
                                                        const Filename = file.filename;
                                                        const newPath = path.join(projectFolderPath, Filename);
                                                        fs.renameSync(oldPath, newPath);
                                                        console.log(Filename)
                                                    });
                                                }
                                                const arrayOfUserIds = [];
                                                if (servicesData.length > 0 || servicesData.length === 0) {
                                                    if (servicesData.length === 0) {
                                                        servicesData.push([projectId, null, clientId, null, null, null]); // Add a record with projectId and null serviceId
                                                    } else {
                                                        // Set projectId in servicesData
                                                        servicesData.forEach(serviceData => {
                                                            serviceData[0] = projectId;
                                                            serviceData[2] = clientId;
                                                            serviceData[3] = serviceDates[serviceData[1]] || null;
                                                            serviceData[4] = serviceMayorDates[serviceData[1]] || null;
                                                            serviceData[5] = collectedServiceStatusIds[serviceData[1]] || null;
                                                            const userIdsKey = `userIds-${serviceData[1]}`;
                                                            const userIdsString = req.body[userIdsKey];
                                                            const userIdsArray = userIdsString ? JSON.parse(userIdsString) : []; // Parse only if data is provided
                                                            const subServiceIds = collectedSubServiceIds[serviceData[1]] || [];
                                                            const subServiceStatusIds = collectedSubServiceStatusIds[serviceData[1]] || [];
                                                            const subServiceMayorDate = collectedSubServiceMayorDate[serviceData[1]] || [];
                                                            const subServiceMainDate = collectedSubServiceMainDate[serviceData[1]] || [];
                                                            const subServiceUserIds = collectedSubServiceUserIds[serviceData[1]] || [];
                                                            const stringifiedSubServiceUserIds = subServiceUserIds.map(innerArray => JSON.stringify(innerArray));
                                                            let subServiceData;
                                                            if (subServiceIds.length > 0) {
                                                                subServiceData = subServiceIds.map((subServiceId, index) => [
                                                                    projectId, 
                                                                    serviceData[1], 
                                                                    serviceData[2], 
                                                                    serviceData[3], 
                                                                    serviceData[4], 
                                                                    serviceData[5], 
                                                                    JSON.stringify(userIdsArray), 
                                                                    subServiceId, 
                                                                    subServiceStatusIds[index],
                                                                    stringifiedSubServiceUserIds[index],
                                                                    subServiceMainDate[index],
                                                                    subServiceMayorDate[index],
                                                                ]);
                                                            } else {
                                                                callback(); // Move to the next iteration
                                                            }
                                                            arrayOfUserIds.push(...subServiceData.map(data => [
                                                                projectId, 
                                                                serviceData[1], 
                                                                clientId, 
                                                                data[3], 
                                                                data[4], 
                                                                data[5], 
                                                                JSON.stringify(userIdsArray), 
                                                                data[7],
                                                                data[8],
                                                                data[9],
                                                                data[10],
                                                                data[11],
                                                            ])); // Store data for arrayOfUserIds
                                                        });                            
                                                    }
                                                    // Use a Set to keep track of unique arrays
                                                    const uniqueArrays = new Set();
                                                    // Function to convert arrays to strings for easy comparison
                                                    const arrayToString = (arr) => JSON.stringify(arr);
                                                    // Filter out duplicates
                                                    const filteredArray = arrayOfUserIds.filter((arr) => {
                                                    const stringRepresentation = arrayToString(arr);
                                                    const isUnique = !uniqueArrays.has(stringRepresentation);
                                                    if (isUnique) {
                                                        uniqueArrays.add(stringRepresentation);
                                                    }
                                                    return isUnique;
                                                    });
                                                    connection.query(sqlInsertServiceProjects, [filteredArray], (err, serviceProjectInsertResult) => {
                                                        if (err) {
                                                            console.error('Error inserting user IDs to services_to_project:', err);
                                                        }
                                                        connection.commit((err) => {
                                                            if (err) {
                                                                console.error('Error committing transaction:', err);
                                                                connection.rollback(() => {
                                                                    connection.release();
                                                                    res.status(500).send('Internal Server Error');
                                                                });
                                                                return;
                                                            }
                                                            connection.release();
                                                            res.send('Successfully added!');
                                                            console.log(result);
                                                        });
                                                    });
                                                } else {
                                                    connection.commit((err) => {
                                                        if (err) {
                                                            console.error('Error committing transaction:', err);
                                                            connection.rollback(() => {
                                                                connection.release();
                                                                res.status(500).send('Internal Server Error');
                                                            });
                                                            return;
                                                        }
                                                        connection.release();
                                                        res.send('Successfully added!');
                                                        console.log(result);
                                                    });
                                                }
                                            });
                                        });
                                    });
                                    // });
                                });
                            });
                        }
                    );
                }
            });
        }catch (error){
            console.log('Error:', error); 
        }
    });
    return router; // Return the router from the function
};
