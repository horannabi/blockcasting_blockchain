module.exports = {
    user          : process.env.NODE_ORACLEDB_USER || "asdf",
    password      : process.env.NODE_ORACLEDB_PASSWORD || "asdf",
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10gXE",
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };