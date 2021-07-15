const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000

const public = path.join(__dirname, '../public')

app.use(express.static(public))
app.use(express.json())

app.get('/', (req, res)=>{
    res.render('/index.html')
})

io.on('connection', (socket)=>{
    console.log('New user connected')

    let user;

    socket.on('newMessage', data =>{
        io.emit('message', data)
    })

    socket.on('setUser', data =>{
        user = data
        io.emit('message', `${data} joined the chat`)
    })

    socket.on('disconnect', ()=>{
        console.log('User disconnected')
        io.emit('message', `${user} left the chat`)
    })
})

server.listen(PORT, ()=>{console.log(`Up in port ${PORT}`)})
