var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/
    if (path === '/home.html') {
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        const session = JSON.parse(fs.readFileSync('./db/session.json').toString())
        let sessionId = 0
        try {
            sessionId = request.headers['cookie'].split('=')[1];
            console.log(sessionId)
        } catch (error) {
        }
        if (sessionId && session[sessionId]) {
            const usersArray = JSON.parse(fs.readFileSync('./db/users.json'))
            const userId = session[sessionId].user_id//获取session的随机数
            const users = usersArray.find(users => users.id === userId)//加强验证  获取name
            let string;
            if (users) {
                const homeHtml = fs.readFileSync('./home.html').toString()
                string = homeHtml.replace('{{loginStatus}}', `${users.name},已登录`)
            } else {
                const homeHtml = fs.readFileSync('./home.html').toString()
                string = homeHtml.replace('{{loginStatus}}', '未登录')
            }
            response.write(string)

        } else {
            console.log('sb')
            const homeHtml = fs.readFileSync('./home.html').toString()
            const string = homeHtml.replace('{{loginStatus}}', '未登录')
            response.write(string)
        }
        response.end()
    }
    else if (path === '/sign_in' && method === 'POST') {
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        const usersArray = JSON.parse(fs.readFileSync('./db/users.json'))//读全部的JSON数据 解析出来放进array数组

        const array = []
        request.on('data', (chunk) => {
            array.push(chunk)
        })
        request.on('end', () => {
            const string = Buffer.concat(array).toString()//data事件接受传过来的参数，Buffer解析成JSON格式的
            const obj = JSON.parse(string)//读接受传过来JSON数据
            const users = usersArray.find((users) => users.name === obj.name && users.password === obj.password)
            console.log(users)
            //const users = usersArray.find((usersArray) => usersArray.name === obj.name && usersArray.password === obj.password)
            if (users === undefined) {
                response.statusCode = 400
                response.end('不匹配')
            } else {
                response.statusCode = 200
                console.log(users.id)
                const random = Math.random()
                const session = JSON.parse(fs.readFileSync('./db/session.json').toString())
                for (let key in session) {
                    console.log(key)
                    if (session[key].user_id === users.id) {
                        delete session[key]
                    }
                }
                session[random] = { user_id: users.id }
                fs.writeFileSync('./db/session.json', JSON.stringify(session))
                response.setHeader("set-cookie", `user_id=${random};HttpOnly`)
                response.end();
            }
        })
    } else if (path === '/register' && method === "POST") {
        const users = JSON.parse(fs.readFileSync('./db/users.json'))
        const array = []
        request.on('data', (chunk) => {
            array.push(chunk)
        })
        request.on('end', () => {
            const string = Buffer.concat(array).toString()
            const obj = JSON.parse(string)//读
            const newUser = {
                id: users[users.length - 1].id + 1,
                name: obj.name,
                password: obj.password
            }
            users.push(newUser)
            fs.writeFileSync('./db/users.json', JSON.stringify(users))//写
            response.end();
        })
    } else {
        console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
        if (path === '/') {
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/html;charset=utf-8')
            response.write(`<!DOCTYPE html>
        <h1>这是一段H1文字,并请求了一个style.css</h1>
        <link rel='stylesheet' href='/style.css'></link>`)
            response.end()
        } else if (path === '/register.html') {
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/html;charset=utf-8')
            response.write(fs.readFileSync('register.html'))
            response.end()
        } else if (path === '/sign_in.html') {
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/html;charset=utf-8')
            response.write(fs.readFileSync('sign_in.html'))
            response.end()
        } else if (path === '/home.html') {
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/html;charset=utf-8')
            response.write(fs.readFileSync('home.html'))
            response.end()
        } else {
            response.statusCode = 404
            response.setHeader('Content-Type', 'text/html;charset=utf-8')
            response.write(`你输入的路径不存在对应的内容`)
            response.end()
        }
    }

    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

