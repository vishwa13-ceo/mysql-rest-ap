const { faker } = require('@faker-js/faker');
const express = require("express");
const app = express();
const port = 3000;
const mysql = require('mysql2');
const path = require("path");
const methodOverride = require("method-override");


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'DELTA',
  password: 'dbms123'
});


let createRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
}

//home page
app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = (result[0]["COUNT(*)"]);
      res.render("home.ejs", { count });

    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
})


//show users
app.get("/users", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
})


//edit users
app.get("/users/:id/edit", (req, res) => {
  let id = req.params.id;
  let q = `SELECT * FROM user WHERE userid='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0]; //access of the object(user)
      console.log(result); 
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
})


//UPDATE route(DB)
app.patch("/user/:id",(req,res)=>{
  let {id} = req.params;
  let{password:formPass ,username :newUsername} = req.body;
  let q =`SELECT * FROM user WHERE userid='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0]; //access of the object(user)
     if(formPass!=user.password){
      res.send("Wrong Password");
     }
     else{
      let q2 = `UPDATE user SET username='${newUsername}' WHERE userid='${id}'`;
      connection.query(q2,(err,result)=>{
        if(err) throw err
        res.redirect("/users");
      });
     }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});


//Add user
app.get("/users/add",(req,res)=>{
  res.render("add.ejs");
});

app.post("/users/add",(req,res)=>{
  let {username,email,password} = req.body;
  const userid = faker.string.uuid();

  let q = `INSERT INTO user (userid,username,email,password) VALUES(?,?,?,?)`;
  connection.query(q,[userid,username,email,password],(err,result)=>{
    if(err) throw err
    res.redirect("/users");
  })

});



//delete user
app.get("/users/:id/delete",(req,res)=>{
  let id = req.params.id;
  let q = `SELECT * FROM user WHERE userid='${id}'`;

  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs",{user});
  })}catch(err){
    console.log(err);
    res.send("Some error in DB");
  }
});



//delete user from DB
app.delete("/users/:id/delete",(req,res)=>{
  let id = req.params.id;
  let {password : formPass} =req.body;

  //fetching user to verify password
  let q = `SELECT * FROM user WHERE userid='${id}'`;

  try{
    connection.query(q,(err,result)=>{
      if (err) throw err
      let user = result[0];
      if(formPass!=user.password){
        res.send("Wrong password");
      }
      else{
        try{
          let q2 =`DELETE FROM user WHERE userid='${id}'`;
          connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/users");
          })
        }catch(err){
          console.log(err);
          res.send("Some error in DB");
        }
      };
    })
  }catch(err){
    console.log(err);
    res.send("Some err in DB");
  }  
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});