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
    module.exports.config = async function (host, user, password, database) {
        this.configuration = {
            host: host,
            user: user,
            password: password,
            database: database
        }
    }

    module.exports.query = async function (sql, args = null) {
        // VAR THAT DEFINES IF CONNECTION WILL CLOSE AUTOMATICALLY :: DEFAULT :: TRUE
        var close = true;
        if (!this.connection) {
            if (this.configuration) {
                // CONNECT TO DB
                this.connection = mysql.createConnection(this.configuration);
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
                    this.close();
                    return reject(err);
                }else{
                    resolve(rows);
                    if (close) {
                        this.close();
                    }
                }
            });
        });
    }


    // CLOSING CONNECTION IF EXISTS    
    module.exports.close = async function() {
        if (this.connection) {
            return new Promise((resolve, reject) => {
                this.connection.end(err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
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
        if (this.configuration) {
            this.connection = mysql.createConnection(this.configuration);
        }else{
            console.log(new Date().toISOString() + ' : ' + (chalk.red("Cannot connect to a database without a configuration! ")));
            return null;
        }
    }


