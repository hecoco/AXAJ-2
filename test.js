const fs = require('fs')

const usersString = fs.readFileSync('./db/users.json').toString()
const usersArray = JSON.parse(usersString)//反序列化
console.log(usersArray)

const user3 = {
    "id": 3,
    "name": "tom",
    "pwd": 123
}
usersArray.push(user3)
const string = JSON.stringify(usersArray)//序列化
fs.writeFileSync('./db/users.json', string)