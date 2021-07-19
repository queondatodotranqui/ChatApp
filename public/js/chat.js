
const socket = io()

const enviar = document.getElementById('form')
const setUser = document.getElementById('setUser')
const save = document.getElementById('save')
const place = document.getElementById('sendLocation')
const messa = document.getElementById('send')

const sidebar = document.getElementById('sidebar').innerHTML
const box = document.getElementById('box').innerHTML
const messages = document.getElementById('messages');
const locationBox = document.getElementById('locationBox').innerHTML

const { username , room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () =>{

    const newMessage = messages.lastElementChild

    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    const visibleHeight = messages.offsetHeight

    const containerHeight = messages.scrollHeight

    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset ){
        messages.scrollTop = messages.scrollHeight
    }

    console.log(newMessageMargin)
}

enviar.addEventListener('submit', (e)=>{
    e.preventDefault()
    const mensaje = e.target.elements.message.value.trim()
    if(mensaje){
        socket.emit('newMessage',{username, room, mensaje}, (error)=>{
            if(error){
                return console.log(error)
            }
        })
        e.target.elements.message.value = ''
    }
})

place.addEventListener('click', ()=>{
    if(!navigator){
        return alert('please turn on geolocation')
    }

    place.classList.add('disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, (mes)=>{
            console.log('location shared!', mes)
            place.classList.remove('disabled')
        })
    })
})

socket.on('message', ({text, username, createdAt}) =>{ 
    const html = Mustache.render(box,{
        text,
        username,
        createdAt:moment(createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationShared', ({username, link})=>{
    const locat = Mustache.render(locationBox, {
        link,
        username,
        createdAt: moment(new Date().getTime()).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', locat)
    autoscroll()
}, (mes)=>{
    console.log(mes)
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({room, users}) =>{
    const html = Mustache.render(sidebar, {
        room,
        users:users.inRoom
    })
    console.log(users)
    document.getElementById('chat__sidebar').innerHTML = html
})