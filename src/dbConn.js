var oracledb = require('oracledb');
var dbConfig = require('./dbConfig.js');

oracledb.autoCommit = true;


//router.post('/selectAddress', function(request, response){
oracledb.getConnection(
    {
      user          : dbConfig.user,
      password      : dbConfig.password,
      connectString : dbConfig.connectString
    },
    function(err, connection){
      if (err) {
        console.error(err.message);
        return;
      }
      console.log("address Select");

      var query = "select klatn_address from users WHERE user_Id=k1088047063";
      connection.execute(query, function(err, result){
          if (err) {
            console.error(err.message);
            doRelease(connection);
            return;
          }
          console.log(result.metaData);
          console.log(result.rows);
          doRelease(connection, result.rows);
        });
    });
  
  function doRelease(connection, dbdata){
    connection.close(function(err) {
        if (err) {
          console.error(err.message);
        }

        response.send(''+dbdata);
      });
  }
//});