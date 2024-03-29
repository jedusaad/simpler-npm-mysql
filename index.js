/**
 * Database module
 * @author João Eduardo Saad
 * @since 21/12/2017
 *
 */

var mysql = require('mysql');
const chalk = require('chalk');

    // DECLARING CONFIG PROPERTY OF MODULE
    var configuration = false;
    var connection = false;

    //CONFIGURATION FUNCTION TO SET UP CONNECTION INFO
    module.exports.config = async function (host, user, password, database, port = 3306) {
        this.configuration = {
            host: host,
            user: user,
            password: password,
            database: database,
            port: port
        }
    }

    module.exports.query = async function (sql, args = null) {
        // console.log("NEW QUERY");
        
        // VAR THAT DEFINES IF CONNECTION WILL CLOSE AUTOMATICALLY :: DEFAULT :: TRUE
        var close = true;
        if (!this.connection) {
            if (this.configuration) {
                // console.log('NO CONNECTION, CREATING NEW ONE');
                // CONNECT TO DB
                await this.connect();
            }else{
                // SEND ERROR TELLING THAT CANNOT CONNECT IF THERE IS NO CONFIGURATION
                console.log(new Date().toISOString() + ' : ' + (chalk.red("Cannot execute a query without a connection or configuration!")));
                return null;
            }
        }else{
            // IF THERE WAS A CONNECTION PRIOR TO THIS FUNCTION EXECUTION THE CONNECTION WILL NOT CLOSE AUTOMATICALLY
            close = false;
        }
                
        // AFTER CONFIG IS SET CALLS THE QUERY
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err){   
                    return reject(err);
                }else{
                    return resolve(rows);
                }
            });
        }).then((result) => {
            // console.log(result);
            if (close) {
                this.close();    
            }
            return result;
        });
    }

    // CLOSING CONNECTION IF EXISTS    
    module.exports.close = async function() {
        // console.log("CLOSING CONN");
        
        if (this.connection) {
            return new Promise((resolve, reject) => {
                this.connection.end(err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
                this.connection = null;
            });    
        }else{
            console.log(new Date().toISOString() + ' : ' + (chalk.yellow("Cannot close a connection that doesn't exists!")));
            return null;
        }    
    }

    // EXECUTE ANY QUERY WITH OR WIHOUT SQL INJECT PROTECTION 
    module.exports.execute = async function (query) {
        var result = await this.query(query.sql, query.args)
            .then(rows => {
                // console.log(rows);
                return rows;
            });
        await this.close()
            .then(() => {
            });
        return result;
    }
    
    // PRINTS THE CONFIGURATION OF THE DATABASE
    module.exports.teste = async function(){
        console.log(this.configuration);
        
    }

    // FUNCTION TO CONNECT TO THE DATABASE 
    module.exports.connect = async function(){
        // console.log('STARTING CONN');
        
        if (this.configuration) {
            try {
                this.connection = mysql.createConnection(this.configuration);
            } catch (error) {
                console.error(error);
                console.error('Connection failed, new attempt in 5 seconds');
                setTimeout(() => {
                    try {
                        this.connection = mysql.createConnection(this.configuration);
                    } catch (error) {
                        console.error(error);
                        console.error('Attempt 2 of connection failed, new attempt in 5 seconds');
                        setTimeout(() => {
                            try {
                                this.connection = mysql.createConnection(this.configuration);
                            } catch (error) {
                                console.error(error);
                                console.error('Attempt 3 of connection failed, giving up connecting.');
                            }
                        }, 5000);
                    }
                }, 5000);
            }
            // this.connection = mysql.createConnection(this.configuration);
        }else{
            console.log(new Date().toISOString() + ' : ' + (chalk.red("Cannot connect to a database without a configuration! ")));
            return null;
        }
    }


