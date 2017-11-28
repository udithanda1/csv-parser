const config = module.exports;

config.db = {
    user: 'root',
    password: '',
    name: '1500city_db'
};

config.db.details = {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
};

config.serverPort = {
    port: 8080,
    test_port: 8081,
    test_env: 'test'
};

config.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=',
    refSecret: '/VdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdhzE='
};