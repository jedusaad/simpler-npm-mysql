const sMysql = require('./index');

class Users {
    id;
    name;
    email;
    test_id
}

sMysql
    .select('users')
    .fields(new Users())
    .run();

console.log('query content', sMysql.dumpBuildQuery());