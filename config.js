exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://trig:c0ding!@ds153699.mlab.com:53699/stock-trax-db';
exports.PORT = process.env.PORT || 8080;
