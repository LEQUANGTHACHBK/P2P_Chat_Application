const socket = io("http://localhost:3000");
$("#Chat_div").hide();
socket.on("DS_ONLINE", function(data) {
  $("#Chat_div").show();
  $("#Register_div").hide();
  var name = document.getElementById("name").textContent;
  const index = data.findIndex(user => user.ten === name);
  data.splice(index, 1);
  $("#ulUser").html("");
  data.forEach(user => {
    $("#ulUser").append(`<li id="${user.peerId}">${user.ten}</li>`);
  });
  socket.on("CO_NGUOI_DK_MOI", user => {
    $("#ulUser").append(`<li id="${user.peerId}">${user.ten}</li>`);
  });
});
socket.on("HIEN_THI_TEN", data => {
  $("#name").html(data.ten);
  $("#peerid").html(data.peerId);
});
socket.on("AI_DO_NGAT_KET_NOI", data => {
  var name = document.getElementById("name").textContent;
  const index = data.findIndex(user => user.ten === name);
  data.splice(index, 1);
  $("#ulUser").html("");
  data.forEach(user => {
    $("#ulUser").append(`<li id="${user.peerId}">${user.ten}</li>`);
  });
});
socket.on("DK_THATBAI", () => {
  alert("Vui Lòng Chọn UserName Khác");
});

const peer = new Peer();
var conect = null;
peer.on("open", id => {
  $("#btnSignUp").click(() => {
    var username = $("#txtUsername").val();
    socket.emit("NGUOI_DUNG_DK", { ten: username, peerId: id });
  });
});
var idconnected="";
var name ="";
// Tạo Kết Nối và Gửi Dữ Liệu
$("#ulUser").on("click", "li", function() {
  var id = $(this).attr("id");
  idconnected = id;
  conect = peer.connect(`${id}`);
  name = document.getElementById(id).textContent;
  conect.on("open", function() {
    listen();
  });
});

//Nhận Dữ Liệu
peer.on("connection", function(conect) {
  conect.on("data", function(data) {
    if(data.type == 0){
      showMessage(data);
    }
    else{
      showMessage(data.sms1);
      Receive(data);
    }
  });
});

//Sent Text
$('#btnSend').click(function(){
  if (conect === null) {
    alert("Vui lòng kết nối đến 1 người");
  } else {
    var smsJson = {
      type: "0",
      name: document.getElementById("name").textContent,
      peerid:document.getElementById("peerid").textContent,
      content: document.getElementById("txtChat").value
    };
    conect.send(smsJson);
    showMessage(smsJson);
    document.getElementById("txtChat").value = "";
  }
})

//Sent File
function listen() {
  if (conect !== null) {
    conect.on("data", function(smsJson) {
      showMessage(smsJson);
    });
  }
}

function showMessage(smsJson) {
  var list = document.getElementById("list");
  if(smsJson.peerid === document.getElementById("peerid").textContent){
    var namesent = document.getElementById(idconnected).textContent;
    list.innerHTML = list.innerHTML + "<div>" +"<b>" + " To " + namesent+ "</b>" +" : " + smsJson.content + "</div>";
  }
  else{
    list.innerHTML =
    list.innerHTML + "<div style='color:red;'>" +"<b>" +smsJson.name+ " : " + "</b>" + smsJson.content + "</div>";
  }
}

//Sending File
document.getElementById("btnSendFile").onclick = function() {
  if (conect === null) {
    alert("Please connect someone!");
  } else {
    const input = document.querySelector('input[type="file"]').files[0];
    const reader = new FileReader();
    var slice = input.slice(0, 100000);
    reader.readAsArrayBuffer(slice);
    reader.onload = function() {
      var arraybuffer = reader.result;
      var smsJson1 = {
        type: "0",
        name: document.getElementById("name").textContent,
        peerid:document.getElementById("peerid").textContent,
        content: 'Gửi đến bạn 1 file, bấm Reiceve để nhận'
      }
      var smsJson2 = {
        type: "0",
        name: document.getElementById("name").textContent,
        peerid:document.getElementById("peerid").textContent,
        content: 'Bạn vừa gửi một file'
      }
      var files = {
        type: "1",
        name: input.name,
        file: arraybuffer,
        sms1: smsJson1,
        sms2: smsJson2
      };
      conect.send(files);
    };
    showMessage(files.sms2);
    document.getElementById("file").value = "";
  }
};

function Receive(file){
  $("#btnReceiveFile").css("background-color","red");
  document.getElementById("btnReceiveFile").addEventListener(
    "click",
    function() {
      var blod = new Blob([new Uint8Array(file.file)], {
        type: "text/plain;charset=uft-8"
      });
      if(file.type == 1){
        saveAs(blod, file.name);
        $("#btnReceiveFile").css("background-color","blue");
        file.type = 2;
      }
    },
    false
  );
}

