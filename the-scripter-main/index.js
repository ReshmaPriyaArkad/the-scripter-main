const express = require('express')
const { spawn } = require('child_process');
const { spawnSync } = require('child_process');
const { exec } = require('child_process');
var cp = require('child_process');
const util = require('util');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const { url } = require('inspector');
const { channel } = require('diagnostics_channel');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const { version } = require('os');
const port = 8080
var nodemailer = require('nodemailer');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var randtoken = require('rand-token');
const { token } = require('morgan');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database: 'scripter',
    multipleStatements: true
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected! to database");
});

const app = express();

app.use(express.static('views'));

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.set('view engine', 'ejs') // Set the template engine as ejs
app.set('views', path.join(__dirname, '/views'))

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

app.post('/doOpenAccount', urlencodedParser, (req, res) => {
    let name = req.body.username;
    let emailid = req.body.emailid;
    let password = req.body.password;
    let confirmpass = req.body.confirmpassword;
    if (password != confirmpass) {
        let passErr = { "error": "Passwords Doesn't match", "displayInfo": "hideLogin" }
        res.render('login.ejs', passErr);
    } else {
        let sqlCheckMailId = "select mailid from logincredentials;";
        db.query(sqlCheckMailId, (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                let check = 0;
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i]['mailid'] == emailid) {
                        check = 1;
                        let errMsg = { "error": "Mail Id Already Exists. Try Login", "displayInfo": "hideLogin" }
                        res.render('login.ejs', errMsg);
                    }
                }
                if (check == 0) {
                    let sqlCreateAccount = "insert into logincredentials ( mailId, userName, Password ) values ('" + emailid + "','" + name + "','" + password + "');";
                    db.query(sqlCreateAccount, (err, rows) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Account Created Successfully !");
                        }
                    })
                    let sqlFetchUserName = "select username from logincredentials where mailid = '" + emailid + "'; "
                    db.query(sqlFetchUserName, (err, rows0) => {
                        if (err)
                            console.log(err);
                        else {
                            let sqlFetchFiles = "select fileName, status from userfiles where mailid = ('" + emailid + "'); ";
                            let files = [];
                            db.query(sqlFetchFiles, (err, rows1) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    for (let i = 0; i < rows1.length; i++) {
                                        let modifiedFileName = rows1[i]['fileName'].split('_m_')
                                        files.push(modifiedFileName[0] + modifiedFileName[2]);
                                        files.push(rows1[i]['status']);
                                    }

                                    let uploadMsg = "Hey, Your Account Created Successfully !";
                                    let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-blue-100 border-t-4  border-blue-500 dark:bg-blue-200 width-low";
                                    req.session.user = emailid;
                                    const details = { "name": rows0[0]['username'], "files": files, "count": files.length, "mailid": emailid, "uploadMsg": uploadMsg, "classname": classname };
                                    res.status(200).render('dashboard.ejs', details);
                                }
                            })
                        }
                    });
                }
            }
        })
    }
})
app.post('/doLogin', urlencodedParser, (req, res) => {
    let emailid = req.body.emailid;
    let password = req.body.password;
    let sqlDoLogin = "select username, mailid, password from logincredentials;";
    let userName = "";
    db.query(sqlDoLogin, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            let check = 1;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i]['mailid'] == emailid && rows[i]['password'] == password) {
                    console.log("Login Successful !");
                    userName = rows[i]['username'];
                    emailid = rows[i]['mailid'];
                    check = 0;
                }
            }
            if (check == 1) {
                let errMsg = { "error": "Invalid Username / Password", "displayInfo": "hideRegister" }
                res.render('login.ejs', errMsg);
            } else {
                let sqlFetchFiles = "select fileName, status from userfiles where mailid = ('" + emailid + "'); ";
                let files = [];
                db.query(sqlFetchFiles, (err, rows1) => {
                    if (err) {
                        console.log(err);
                    } else {
                        for (let i = 0; i < rows1.length; i++) {
                            let modifiedFileName = rows1[i]['fileName'].split('_m_')
                            files.push(modifiedFileName[0] + modifiedFileName[2]);
                            files.push(rows1[i]['status']);
                        }
                        let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-blue-100 border-t-4  border-blue-500 dark:bg-blue-200 width-low";
                        req.session.user = emailid;
                        const details = { "name": userName, "files": files, "count": files.length, "mailid": emailid, "uploadMsg": "Check Out Your Programs ", "classname": classname };
                        res.status(200).render('dashboard.ejs', details);
                    }
                })
            }
        }
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.send("Error !")
        } else {
            let infoMsg = { "error": "You are Logged Out Successfully !", "displayInfo": "hideRegister" }
            res.render('login.ejs', infoMsg);
        }
    })
})


app.post("/fileUpload", function(request, response, next) {

    var storage = multer.diskStorage({

        destination: function(request, file, callback) {
            callback(null, './programs');
        },
        filename: function(request, file, callback) {
            global.file_name = file.originalname
            callback(null, file_name);

        }

    });

    var upload = multer({ storage: storage }).single('uploadthis');

    upload(request, response, function(error) {
        let mailid = request.body.usermail;
        let tmpMail = mailid.split('@')
        let old_name = file_name.split(".");
        let new_name = old_name[0] + "_m_" + tmpMail[0] + '_m_.' + old_name[1];

        function fileDeleter(message) {
            fs.unlink(__dirname + "/programs/" + file_name, (err => {
                if (err) console.log(err);
            }));
            let sqlFetchUserName = "select username from logincredentials where mailid = '" + mailid + "'; "
            db.query(sqlFetchUserName, (err, rows0) => {
                if (err)
                    console.log(err);
                else {
                    let sqlFetchFiles = "select fileName, status from userfiles where mailid = ('" + mailid + "'); ";
                    let files = [];
                    db.query(sqlFetchFiles, (err, rows1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            for (let i = 0; i < rows1.length; i++) {
                                let modifiedFileName = rows1[i]['fileName'].split('_m_')
                                files.push(modifiedFileName[0] + modifiedFileName[2]);
                                files.push(rows1[i]['status']);
                            }

                            let uploadMsg = message;

                            let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-red-100 border-t-4  border-red-500 dark:bg-red-200 width-low";

                            const details = { "name": rows0[0]['username'], "files": files, "count": files.length, "mailid": mailid, "uploadMsg": uploadMsg, "classname": classname };
                            response.status(200).render('dashboard.ejs', details);
                        }
                    })
                }
            });
        }
        if (!(old_name[1] == 'py' || old_name[1] == 'java' || old_name[1] == 'c')) {
            fileDeleter("Invalid File Extension. Allowed Extensions - .py, .java, .c ")
        }
        if (old_name[1] == 'py' || old_name[1] == 'java' || old_name[1] == 'c') {

            fs.readFile("programs/" + file_name, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                if (data.includes('pyautogui') || data.includes('import os') || data.includes('from os') || data.includes('import simpy') || data.includes('from simpy') || data.includes('import tkinter') || data.includes('from tkinter') || data.includes('customtkinter')) {
                    fileDeleter('We found some modules in your code which are not allowed. Usage of modules like OS, Pyautogui, Plyer, Tkinter are not allowed. Check Terms of usage for more information.')
                } else {
                    fs.renameSync("programs/" + file_name, "programs/" + new_name, (error) => {
                        if (error)
                            console.log(error);
                    });
                    if (error) {
                        return response.end('Error Uploading File');
                    } else {
                        let sqlInsertFileName = "insert into userfiles (mailId, fileName) values ('" + mailid + "', '" + new_name + "'); ";
                        let check = 0;
                        db.query(sqlInsertFileName, (err, rows) => {
                            if (err) {
                                check = 1;;
                            }
                            let sqlFetchUserName = "select username from logincredentials where mailid = '" + mailid + "'; "
                            db.query(sqlFetchUserName, (err, rows0) => {
                                if (err)
                                    console.log(err);
                                else {
                                    let sqlFetchFiles = "select fileName, status from userfiles where mailid = ('" + mailid + "'); ";
                                    let files = [];
                                    db.query(sqlFetchFiles, (err, rows1) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            for (let i = 0; i < rows1.length; i++) {
                                                let modifiedFileName = rows1[i]['fileName'].split('_m_')
                                                files.push(modifiedFileName[0] + modifiedFileName[2]);
                                                files.push(rows1[i]['status']);
                                            }

                                            let uploadMsg = "File Upload Successful !";
                                            if (check == 1) {
                                                uploadMsg = "File Replaced Successfully !";
                                            }
                                            let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-blue-100 border-t-4  border-blue-500 dark:bg-blue-200 width-low";
                                            const details = { "name": rows0[0]['username'], "files": files, "count": files.length, "mailid": mailid, "uploadMsg": uploadMsg, "classname": classname };
                                            response.status(200).render('dashboard.ejs', details);
                                        }
                                    })
                                }
                            });

                        })
                    }
                }
            });

        }
    });

});

module.exports = router;

app.post('/deleteFile', urlencodedParser, (req, res) => {
    let mailid = req.body.mailid;
    let fileName = req.body.fileName;
    fileName = fileName.split('.');
    let tmpMail = mailid.split('@');
    let actual_name = fileName[0] + '_m_' + tmpMail[0] + '_m_.' + fileName[1];
    fs.unlink(__dirname + "/programs/" + actual_name, (err => {
        if (err) console.log(err);
        else {
            console.log("\nDeleted file: example_file.txt");
        }
    }));
    let sqlDeleteFile = "delete from userfiles where mailid = '" + mailid + "' and filename = '" + actual_name + "'; ";
    db.query(sqlDeleteFile, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            let sqlFetchUserName = "select username from logincredentials where mailid = '" + mailid + "'; "
            db.query(sqlFetchUserName, (err, rows0) => {
                if (err)
                    console.log(err);
                else {
                    let sqlFetchFiles = "select fileName, status from userfiles where mailid = ('" + mailid + "'); ";
                    let files = [];
                    db.query(sqlFetchFiles, (err, rows1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            for (let i = 0; i < rows1.length; i++) {
                                let modifiedFileName = rows1[i]['fileName'].split('_m_')
                                files.push(modifiedFileName[0] + modifiedFileName[2]);
                                files.push(rows1[i]['status']);
                            }

                            let uploadMsg = "File Deleted Successfully...";
                            let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-red-100 border-t-4  border-red-500 dark:bg-red-200 width-low";

                            const details = { "name": rows0[0]['username'], "files": files, "count": files.length, "mailid": mailid, "uploadMsg": uploadMsg, "classname": classname };
                            res.status(200).render('dashboard.ejs', details);
                        }
                    })
                }
            });
        }
    })

})
app.post('/runFile', urlencodedParser, (req, res) => {
    let mailid = req.body.mailid;
    let fileName = req.body.filename;
    let tmpName = fileName.split(".");
    let tmpMailid = mailid.split('@');
    let dbFileName = tmpName[0] + "_m_" + tmpMailid[0] + "_m_." + tmpName[1];
    let sqlChnageStatus = "update userfiles set status = 'Running' where mailid = ('" + mailid + "') and filename = ('" + dbFileName + "');";

    db.query(sqlChnageStatus, (err, alter_status) => {
        if (err)
            console.log(err);


    })
    let sqlFetchUserName = "select username from logincredentials where mailid = '" + mailid + "'; "
    db.query(sqlFetchUserName, (err, rows0) => {
        if (err)
            console.log(err);
        else {
            let sqlFetchFiles = "select fileName, status from userfiles where mailid = ('" + mailid + "'); ";
            let files = [];
            db.query(sqlFetchFiles, (err, rows1) => {
                if (err) {
                    console.log(err);
                } else {
                    for (let i = 0; i < rows1.length; i++) {
                        let modifiedFileName = rows1[i]['fileName'].split('_m_')
                        files.push(modifiedFileName[0] + modifiedFileName[2]);
                        files.push(rows1[i]['status']);
                    }

                    var dataToSend;
                    let program;
                    if (tmpName[1] == 'py') {
                        program = spawn('python', [`programs/${dbFileName}`]);
                    } else if (tmpName[1] == 'java') {
                        program = spawn('java', [`programs/${dbFileName}`]);
                    } else {
                        let tmpDbFileName = dbFileName.split('.');
                        program = exec('gcc "programs/' + dbFileName + '" -o "programs/' + tmpDbFileName[0] + '" && "programs/' + tmpDbFileName[0] + '.exe"');
                    }
                    program.stdout.on('data', function(data) {
                        dataToSend = data.toString();
                    });
                    // in close event we are sure that stream from child process is closed
                    program.on('close', (code) => {
                        console.log(`Code: ${code}`);
                    });
                    let uploadMsg = "Started Execution Of " + fileName;
                    let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-green-100 border-t-4  border-green-500 dark:bg-green-200 width-low";

                    const details = { "name": rows0[0]['username'], "files": files, "count": files.length, "mailid": mailid, "uploadMsg": uploadMsg, "classname": classname };
                    res.status(200).render('dashboard.ejs', details);

                }
            })
        }
    });

})
app.post('/terminateExecution', urlencodedParser, (req, res) => {
    let mailid = req.body.mailid;
    let fileName = req.body.filename;
    let tmpName = fileName.split(".");
    let tmpMailid = mailid.split('@');
    let dbFileName = tmpName[0] + "_m_" + tmpMailid[0] + "_m_." + tmpName[1];
    let sqlChnageStatus = "update userfiles set status = 'Not Running' where mailid = ('" + mailid + "') and filename = ('" + dbFileName + "');";

    db.query(sqlChnageStatus, (err, alter_status) => {
        if (err)
            console.log(err);


    })
    let sqlFetchUserName = "select username from logincredentials where mailid = '" + mailid + "'; "
    db.query(sqlFetchUserName, (err, rows0) => {
        if (err)
            console.log(err);
        else {
            let sqlFetchFiles = "select fileName, status from userfiles where mailid = ('" + mailid + "'); ";
            let files = [];
            db.query(sqlFetchFiles, (err, rows1) => {
                if (err) {
                    console.log(err);
                } else {
                    for (let i = 0; i < rows1.length; i++) {
                        let modifiedFileName = rows1[i]['fileName'].split('_m_')
                        files.push(modifiedFileName[0] + modifiedFileName[2]);
                        files.push(rows1[i]['status']);
                    }

                    if (tmpName[1] == 'c') {
                        let tmpDbFileName = dbFileName.split('.');
                        dbFileName = tmpDbFileName[0] + '.exe';
                    }
                    if (tmpName[1] == 'java') {
                        let tmpDbFileName = dbFileName.split('.');
                        dbFileName = tmpDbFileName[0];
                    }
                    const terminate = exec(`wmic process where "commandline like '%%` + `programs/${dbFileName}` + `%%'" delete`, (err, stdout, stderr) => {
                        if (err)
                            console.error(`exec error: ${err}`);
                    });
                    // in close event we are sure that stream from child process is closed
                    terminate.on('close', (code) => {
                        console.log(`Code: ${code}`);
                    });
                    let uploadMsg = "Execution Of " + fileName + " Has Terminated";
                    let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-red-100 border-t-4  border-red-500 dark:bg-red-200 width-low";

                    const details = { "name": rows0[0]['username'], "files": files, "count": files.length, "mailid": mailid, "uploadMsg": uploadMsg, "classname": classname };
                    res.status(200).render('dashboard.ejs', details);
                }
            })
        }
    });

})


app.get('/installModules', urlencodedParser, (req, res) => {
    const dir = spawn('cmd', ['/c', 'pip freeze']);
    dir.stdout.on('data', function(availablemodules) {
        availablemodules = availablemodules.toString();
        availablemodules = availablemodules.split('\n');
        let modules_list = [];
        let versions_list = [];
        for (let i = 0; i < availablemodules.length; i++) {
            let tmpLst = availablemodules[i].split('==');
            if (!(tmpLst[0].includes('ARSHAD'))) {
                if (!(tmpLst[0].includes('PyAutoGUI'))) {
                    modules_list.push(tmpLst[0]);
                    versions_list.push(tmpLst[1]);
                }
            }
        }
        let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-blue-100 border-t-4  border-blue-500 dark:bg-blue-200 width-low";
        let modulesList = { "modules": modules_list, "versions": versions_list, "uploadMsg": "No need to enter *pip install* ", "classname": classname };
        res.status(200).render('install_modules.ejs', modulesList);
    });
    dir.stderr.on('data', (data) => console.log(`stderr: ${ data }`));
    // dir.on('close', (code) => console.log(`child process exited with code ${code}`));

})
app.post('/installationStatus', urlencodedParser, (req, res) => {
    let toInstall = req.body.module_name;
    if (toInstall.includes('pip install')) {
        toInstall = toInstall.replace("pip install", "");
    }
    // const installation = spawn('cmd', ['/c', 'pip install ' + toInstall]);
    const installation = cp.spawnSync('cmd', ['/c', 'pip install ' + toInstall], { encoding: 'utf8' });
    let installationOP = installation.stdout;
    let classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-blue-100 border-t-4  border-blue-500 dark:bg-blue-200 width-low";
    if (installationOP.includes('Successfully installed') || installationOP.includes('Requirement already satisfied')) {
        installationOP = "Installation Successful! You can now use " + toInstall + " in your code."
    } else {
        installationOP = "Unknown Module! Error has occured."
        classname = "flex p-4 rounded-md text-center text-lg mb-4 bg-red-100 border-t-4  border-red-500 dark:bg-red-200 width-low"
    }
    const dir = spawn('cmd', ['/c', 'pip freeze']);
    dir.stdout.on('data', function(availablemodules) {
        availablemodules = availablemodules.toString();
        availablemodules = availablemodules.split('\n');
        let modules_list = [];
        let versions_list = [];
        for (let i = 0; i < availablemodules.length; i++) {
            let tmpLst = availablemodules[i].split('==');
            if (!(tmpLst[0].includes('ARSHAD'))) {
                if (!(tmpLst[0].includes('PyAutoGUI'))) {
                    modules_list.push(tmpLst[0]);
                    versions_list.push(tmpLst[1]);
                }
            }
        }
        let modulesList = { "modules": modules_list, "versions": versions_list, "uploadMsg": installationOP, "classname": classname };
        res.render('install_modules.ejs', modulesList);
    })

})

function sendEmail(email, token) {

    var email = email;
    var token = token;

    var mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'siteofficial04@gmail.com',
            pass: 'bxbkogvpggytifvv'
        }
    });

    var mailOptions = {
        from: 'Scripter" <siteofficial04@gmail.com>',
        to: email,
        subject: 'Reset Password Link',
        text: `Hi there,
  
        You recently requested a password reset for your account. Please use the following link to reset your password:
        
        http://localhost:8080/reset-password?token=${token}
        
        If you didn't request this password reset, please ignore this email.

        Regards,
        The Scripter Team`

    };

    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(1)
        } else {
            console.log(0)
        }
    });
}

app.post('/forgetPassword', urlencodedParser, (req, res, next) => {
    var email = req.body.email;

    //console.log(sendEmail(email, fullUrl));

    db.query('SELECT * FROM logincredentials WHERE mailid ="' + email + '"', function(err, result) {
        if (err) throw err;

        var type = '';
        var msg = '';
        if (result.length == 0) {
            console.log('2');
            type = 'error';
            msg = 'The Email is not registered with us';
        } else {

            var token = randtoken.generate(20);

            var sent = sendEmail(email, token);

            let insertToken = "insert into tokens ( mailid, token ) values ('" + email + "','" + token + "');";
            db.query(insertToken, (err, rows) => {
                if (err)
                    console.log(err);
            });

            if (sent != '0') {

                var data = {
                    token: token
                }

                type = 'success';
                msg = 'The reset password link has been sent to your email address';

            } else {
                type = 'error';
                msg = 'Something goes to wrong. Please try again';
            }

        }

        message = { "info": msg, "status": type };
        res.status(200).render('reset_status.ejs', message);
    });
});
app.get('/reset-password', function(req, res, next) {
    let fetchTokens = "select token, mailid from tokens;";
    let current_token = req.query.token;
    let check = 0;
    db.query(fetchTokens, (err, rows) => {
        if (err)
            console.log(err);
        else {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].token == current_token) {
                    res.status(200).render('reset_password.ejs', { "mail": rows[i].mailid });
                    check = 1;
                }
            }
        }
        if (check == 0) {
            message = { "info": "This is an invalid link", "status": "error" };
            res.status(200).render('reset_status.ejs', message);
        }
    });
});
app.post('/updatePassword', urlencodedParser, (req, res, next) => {
    let email = req.body.mailid;
    let password = req.body.password;
    let changePassword = "update logincredentials set password = '" + password + "' where mailid = '" + email + "'; "
    db.query(changePassword, (err, rows0) => {
        if (err)
            console.log(err);
        else {
            let errMsg = { "error": "Your password has changes successfully. Kindly login again!", "displayInfo": "hideRegister" }
            res.render('login.ejs', errMsg);
        }
    });
});

app.listen(port, () => console.log(`Started Execution @ Port No.: ${port}`))