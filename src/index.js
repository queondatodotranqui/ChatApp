const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const filter = require('bad-words')

const { getUser, addUser, getUsersInRoom, removeUser } = require('./utils/users');
const { generateMessage } = require('./utils/messages'); 

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

    socket.on('join', ({username , room}, callback) =>{
        const { error, user} = addUser({ id: socket.id , username, room })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!', 'ADMIN'))
        socket.broadcast.to(room).emit('message', generateMessage(`${user.username} has joined`, 'ADMIN'))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('newMessage', (data , cb) =>{
        const user = getUser(socket.id)
        const newFilter = new filter()

        if(newFilter.isProfane(data.mensaje)){
            return cb('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(data.mensaje, user.username))
        cb()
    })

    socket.on('sendLocation', (data, cb) =>{
        const user = getUser(socket.id)
        io.emit('locationShared',{
            username: user.username,
            link:`https://google.com/maps?q=${data.latitude},${data.longitude}`
        })
        cb('Location delivered')
    })

    socket.on('disconnect', ()=>{
        console.log('User disconnected')
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} left the chat`, 'ADMIN'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(PORT, ()=>{console.log(`Up in port ${PORT}`)})
