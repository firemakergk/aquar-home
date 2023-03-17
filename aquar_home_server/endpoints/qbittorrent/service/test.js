import jwt from 'jsonwebtoken'
console.log(jwt.sign({ uname: 'admin',pass: 'adminadmin'}, 'p3xkCUbUte',{}))