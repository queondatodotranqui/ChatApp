
const socket = io()

const enviar = document.getElementById('form')
const setUser = document.getElementById('setUser')
const save = document.getElementById('save')
const place = document.getElementById('sendLocation')
const messa = document.getElementById('send')
const box = document.getElementById('box').innerHTML
const messages = document.getElementById('messages');
const locationBox = document.getElementById('locationBox').innerHTML

enviar.addEventListener('submit', (e)=>{
    e.preventDefault()
    const mensaje = e.target.elements.message.value.trim()
    if(mensaje){
        socket.emit('newMessage',`${mensaje}`, (error)=>{
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

socket.on('message', data =>{
    console.log(data) 
    const html = Mustache.render(box,{
        message:data.text,
        createdAt:moment(data.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationShared', (data)=>{
    const locat = Mustache.render(locationBox, {
        link: data.link,
        createdAt: moment(new Date().getTime()).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', locat)
}, (mes)=>{
    console.log(mes)
})