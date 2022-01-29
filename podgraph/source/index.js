module.exports = {
  Graphql: require('./graphql').Source,
  Mongodb: require('./mongodb').Source,
  Mysql: require('./mysql').Source,
  Postgresql: require('./postgresql').Source,
  RestApi: require('./rest-api').Source,
};
