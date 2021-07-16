const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const filter = require('bad-words')

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

    socket.on('newMessage', (data , cb) =>{
        const newFilter = new filter()

        if(newFilter.isProfane(data)){
            return cb('Profanity is not allowed')
        }

        io.emit('message', generateMessage(data))
        cb()
    })

    socket.on('sendLocation', (data, cb) =>{
        io.emit('locationShared',{
            link:`https://google.com/maps?q=${data.latitude},${data.longitude}`
        })
        cb('Location delivered')
    })

    socket.on('disconnect', ()=>{
        console.log('User disconnected')
        io.emit('message', generateMessage(`Someone left the chat`))
    })
})

server.listen(PORT, ()=>{console.log(`Up in port ${PORT}`)})
