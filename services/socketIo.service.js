
class SocketIoService{
    static io = null;
    static socket = null;

    constructor(socketIo){
        this.io = socketIo;
        if (SocketIoService.io === null) {
            SocketIoService.io = this.io;
        }

        this.io.on('connection', socket => {
            socket.on('disconnect', () => {}); 
            if (SocketIoService.socket === null) {
                SocketIoService.socket = socket;
            }
        })
    }

}

module.exports = SocketIoService;  