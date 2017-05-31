const md5 = require('md5');

const socketClient = require('socket.io-client');
const serverUrl = 'http://blackmiaool.jios.org:9012/';

class God {
    constructor({
        log=true
    }) {
        const socket = socketClient(serverUrl);
        this.socket = socket;

        this.log = (msg) => {
            if (log) {
                console.log(this.name + " " + msg);
            }
        }
        this.name="god";
        this.main="black";
        socket.on('connect',  () =>{
            this.log("connect");
        });
        socket.on('connect_error',  (error) =>{
            this.log(error);
        });
        socket.on('event',  (data) =>{
            this.log('event', data);
        });
        socket.on('disconnect',  () =>{
            this.log("disconnect");
        });
        socket.on('message', ({
            room,
            type,
            content,
            name
        }) => {
            if (!this.listeners[room]) {
                return;
            }
            if (name === this.username) {
                return;
            }
            const message = {
                type,
                content,
                room,
                name,
                source:this.name
            }
            
            this.listeners[room].forEach(function (cb) {
                cb(message);
            });

        });
        Object.assign(this, {
            listeners: {}
        });
    }
    login(name, password) {
        this.username = name;
        return new Promise((resolve, reject) => {
            this.socket.emit("login", {
                name,
                password:md5(password)
            }, ({
                code,
                msg
            }) => {
                if (!code) {
                    resolve();
                } else {
                    reject(msg);
                }

            });
        });
    }
    send(room, type, content) {
        this.socket.emit("message", {
            nickname: this.nickname,
            content,
            room,
            time: Date.now(),
            type: type
        });
    }
    join(name) {
        return new Promise((resolve, reject) => {
            this.socket.emit("join-room", {
                name
            }, function ({
                code,
                msg
            }) {
                if (!code) {
                    resolve();
                    return;
                } else {
                    reject(msg);
                    return;
                }
            });
        });

    }
    listen(room, cb) {
        if (!this.listeners[room]) {
            this.listeners[room] = [];
        }
        this.listeners[room].push(cb);
    }
}
module.exports = God;

//var god = new God();
//god.login("name", md5("password")).then(function () {
//    console.log("success");
//    god.join("abc").catch(function (e) {
//        console.log(e);
//    });
//    god.send("abcc", "text", "api test");
//    god.send("abc", "text", "api test2");
//    god.listen("abcc", function (message) {
//        console.log("abcc", message);
//    });
//    god.listen("abc", function (message) {
//        console.log("abc", message);
//    });
//
//}).catch(function (e) {
//    console.log(e);
//});
