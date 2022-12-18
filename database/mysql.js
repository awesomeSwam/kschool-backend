// env
require("dotenv");
const {
  MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT
} = process.env;

// Mysql
const mysql = require('mysql');
let mysqlClient;

const handleDisconnect = () => {
  mysqlClient = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT  
  });

  mysqlClient.connect((err) => {
    if(err) {
      console.error(`error when mysql connect error\n>>> ${err}`);
      setTimeout(handleDisconnect, 2000);
    }
    console.log("mysqlClient connected!");
  });

  mysqlClient.on("error", (err) => {
    if(err.code === "PROTOCOL_CONNECTION_LOST")
      return handleDisconnect();
    console.error(err);
  });
}

handleDisconnect();


// pop
const pop = {
  getAll: async () => {
    return await new Promise((resolve) => {
      mysqlClient.query("SELECT * FROM POP", (err, rows, fields) => {
        if (err) console.error(`Mysql pop getAll error\n>>> ${err}`);
        resolve(err ? null : rows);
      });
    });
  },
  update: async (schoolCode, count) => {
    const sql = "INSERT INTO `POP`(`schoolCode`, `pop`) VALUES(?, ?) ON DUPLICATE KEY UPDATE `pop` = `pop` + ?";
    const param = [schoolCode, count, count];
  
    mysqlClient.query(sql, param, (err, rows, fields) => {
      if (err) console.error(`Mysql pop update error\n>>> ${err}`);
    });
  }
};


// school
const school = {
  getAll: async () => {
    return await new Promise((resolve) => {
      mysqlClient.query("SELECT * FROM SCHOOL", (err, rows, fields) => {
        if (err) console.error(`Mysql school get error\n>>> ${err}`);
        resolve(err ? null : rows);
      });
    });
  },
  update: async (schoolData) => {
    const sql = "INSERT IGNORE INTO `SCHOOL` (`schoolName`, `schoolCode`, `cityProvince`, `address`) VALUES (?, ?, ?, ?)";
    const param = [schoolData.schoolName, schoolData.schoolCode, schoolData.cityProvince, schoolData.address];
    mysqlClient.query(sql, param, (err, rows, fields) => {
      if (err) console.error(`Mysql updateSchool error\n>>> ${err}`);
    });
  }
};

const _mysql = {
  pop, school
};

module.exports = _mysql;