const md5 = require('md5');

const socketClient = require('socket.io-client');
const serverUrl = 'http://blackmiaool.jios.org:9012/';

class God {
    constructor() {
        const socket = socketClient(serverUrl);
        this.socket = socket;

        socket.on('connect', function () {
            console.log("on connect");
        });
        socket.on('connect_error', function (error) {
            console.log(error);
        });
        socket.on('event', function (data) {
            console.log('event', data);
        });
        socket.on('disconnect', function () {
            console.log("disconnect");
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
            if (name === this.name) {
                return;
            }
            const message = {
                type,
                content,
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
        this.name = name;
        return new Promise((resolve, reject) => {
            this.socket.emit("login", {
                name,
                password
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
