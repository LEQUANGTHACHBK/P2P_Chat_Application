var express = require('express')
var app = express()
var server = require("http").Server(app);
var io = require("socket.io")(server);

const PORT = 3000 || process.env.PORT;//Port dùng để kết nối
server.listen(PORT,function(){
    console.log("Allready Running On " + PORT);
})

const arrUserInfo = []; // Mảng dùng để lưu danh sách người dùng.

io.on("connection", socket => {
  socket.on("NGUOI_DUNG_DK", data => {//Khi có người dùng đăng ký mới
    var isExist = arrUserInfo.some(element => element.ten === data.ten);
    socket.peerID = data.peerId;
    if (isExist) return socket.emit("DK_THATBAI");// Khi tên người dùng đã tồn tại
    socket.emit("HIEN_THI_TEN", data); 
    arrUserInfo.push(data);
    socket.emit("DS_ONLINE", arrUserInfo); // Hiển thị lại danh sách online 
    console.log(arrUserInfo);
    socket.broadcast.emit("CO_NGUOI_DK_MOI", data); // Thêm tên người dùng mới vào ds online
  });
  socket.on("disconnect", () => {// Khi có ai đó ngắt kết nối
    const index = arrUserInfo.findIndex(user => user.peerId === socket.peerID);
    arrUserInfo.splice(index, 1);
    console.log(arrUserInfo);
    io.sockets.emit("AI_DO_NGAT_KET_NOI", arrUserInfo);
  });
});
