# Simpler-Mysql

A package made to make your life easyer when dealing with MYSQL!

### How to work with:

```sh
$ var sMysql = require('simpler-mysql');

$ sMysql.config(host, user, password, database));
// sMysql.config also takes the port as a last parameter, but if not given, it will fall into 3306 (MySQL Default)
```

Whit this done you have two options:
The first is to work with single-queries connection, the library will connect to the database, do the transation and close the connection. 
```sh
$ sMysql.query('SQL_STATEMENT');
// OR 
$ sMysql.query( 'SQL_WITH_PREPARE_?_STATEMENT_?' , [ arg1 , arg2 ] );
```
The second way is to connect, execute any amount of queries and then close the connection.
```sh
$ sMysql.connect();
// THEN  
$ sMysql.query( 'SQL_WITH_PREPARE_?_STATEMENT_?_1' , [ arg1 , arg2 ] );
$ sMysql.query( 'SQL_WITH_PREPARE_?_STATEMENT_?_2' , [ arg1 , arg2 ] );
$ sMysql.query( 'SQL_WITH_PREPARE_?_STATEMENT_?_3' , [ arg1 , arg2 ] );
// THEN
$ sMysql.close();
```
> Note: If you leave the connection open, it will overload your database with unecessary connections and maybe causing it to crash!

---
### Fixes 0.1.8 Version
```
 - When fatal error occurs after a query attempt, connection is re-stablished and no longer stay broken and disconnected
```

---
### Fixes 0.1.7 Version
```
 - Connection now tries 3 times and logs error in chat. ;
```

### Fixes 0.1.6 Version
```
 - General fixes ;
```
### Fixes 0.1.5 Version
```
 - Read.me instructions , use sMysql.query() instead of sMysql.execute() but ;
```

### Fixes 0.1.4 Version
```
 - sMysql.execute( 'SQL_WITH_PREPARE_?_STATEMENT_?_1' , [ arg1 , arg2 ] );
    Always closing connection even when using 
    
    $ sMysql.connect();
    $ sMysql.close();
```

### Fixes 0.1.3 Version
```
 - Consecutive calls, breaking connection on sMysql.query();
```


