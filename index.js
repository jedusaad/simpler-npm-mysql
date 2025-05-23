/**
 * Database module
 * @author João Eduardo Saad
 * @since 21/12/2017
 *
 */

var mysql = require('mysql');
const chalk = require('chalk');
const templates_sql = require('./templatesQuery.json');
const sql_tags = require('./sqlTags.json');


    // DECLARING CONFIG PROPERTY OF MODULE
    var configuration = false;
    var connection = false;
    var currentQueryOnBuild = '';
    var currentBuildType;
    var currentBuildVariables = [];

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
                    if (err.fatal) { 
                        this.connect();
                    }
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


    // SQL MODULAR BUILD =====================

    // CLEARING THE CURRENT BUILD
    module.exports.clearBuild = function() {
        currentQueryOnBuild = '';
        currentBuildType = null;
    }

    // SELECT QUERY
    module.exports.select = function(from){
        currentQueryOnBuild = templates_sql.SELECT.replace(sql_tags.from, from);
        currentBuildType = sql_tags.select;
        return this;
    }

    module.exports.fields = function(model){
        const modelKeys = Object.keys(model);

        let partialQuery = [];

        modelKeys.forEach(item => {
            if (item.lastIndexOf('_id') != -1) {
                let splitedVariable = item.split('_');
                
                partialQuery.push(`${item} AS ${splitedVariable[0].charAt(0).toUpperCase() + splitedVariable[0].slice(1)}${splitedVariable[1].charAt(0).toUpperCase() + splitedVariable[1].slice(1)}`);

                if (model[item]) {
                    // Join to the current item  
                }
            } else {
                partialQuery.push(`${item} AS ${item.charAt(0).toUpperCase() + item.slice(1)}`);
            }
        });

        currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.fieldlist, partialQuery.join(','));
        return this;
    }

    module.exports.where = function(where){
        currentQueryOnBuild = templates_sql.SELECT.replace(sql_tags.from, from);
        return this;
    }

    module.exports.dumpBuildQuery = function(where){
        return currentQueryOnBuild;
    }

    module.exports.run = function(){

        switch (currentBuildType) {
            case sql_tags.select:
                // If no field list was passed, and the {FIELDLIST} is still present, replace by * at the query as SELECT all
                currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.fieldlist, '*');
                break;

            case sql_tags.update:
                
                break;

            case sql_tags.delete:
                
                break;

            case sql_tags.update:
                
                break;
        
            default:
                break;
        }
        
        // If no where filter was passed, just replace by 1 (WHERE 1) at the final query;
        currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.whereFilters, '1');

        // INNER JOINS CHECKS
        // If {INNERJOINS} is still on the template, just replace by empty string
        if (currentQueryOnBuild.lastIndexOf(sql_tags.innerJoin) != -1) {
            currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.innerJoin, '');
        }

        // If {JOIN} is still on the template, just replace by empty string
        if (currentQueryOnBuild.lastIndexOf(sql_tags.innerJoinContent) != -1) {
            currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.innerJoinContent, '');
        }

        // ORDER BY CHECKS
        // If {ORDERBY} is still on the template, just replace by empty string
        if (currentQueryOnBuild.lastIndexOf(sql_tags.orderBy) != -1) {
            currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.orderBy, '');
        }

        // If {ORDERING} is still on the template, just replace by empty string
        if (currentQueryOnBuild.lastIndexOf(sql_tags.orderByContent) != -1) {
            currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.orderByContent, '');
        }

        // SORT BY CHECKS
        // If {SORTBY} is still on the template, just replace by empty string
        if (currentQueryOnBuild.lastIndexOf(sql_tags.sortBy) != -1) {
            currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.sortBy, '');
        }

        // If {SORTING} is still on the template, just replace by empty string
        if (currentQueryOnBuild.lastIndexOf(sql_tags.sortByContent) != -1) {
            currentQueryOnBuild = currentQueryOnBuild.replace(sql_tags.sortByContent, '');
        }        
    }



