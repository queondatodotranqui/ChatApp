
const socket = io()

const enviar = document.getElementById('form')
const setUser = document.getElementById('setUser')
const save = document.getElementById('save')

let user;

save.addEventListener('click', ()=>{
    if(user){
        save.classList.add('disabled')
        socket.emit('setUser', user)
    }
})

setUser.addEventListener('submit', (e)=>{
    e.preventDefault()
    user = e.target.elements.name.value.trim()
})

enviar.addEventListener('submit', (e)=>{
    e.preventDefault()
    const mensaje = e.target.elements.message.value.trim()
    if(mensaje && user){
        socket.emit('newMessage',`${user}: ${mensaje}`)
        e.target.elements.message.value = ''
    }
})

socket.on('message', data =>{
    console.log(data) 
})