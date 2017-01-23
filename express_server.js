var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs');
var path = require("path");

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8081');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var urlArrary = new Array();
var baseUrlOfPic = "http://127.0.0.1:8081/";

function getBaseDir() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    return "image/" + year + "/" + month;
}

//递归创建目录 异步方法
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            //console.log(path.dirname(dirname));
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

//递归创建目录 同步方法
function mkdirsSync(dirname) {
    //console.log(dirname);
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function checkDirAndFile(dirPath, success) {
    if (fs.existsSync(dirPath)) {
        console.log('已经创建过此更新目录了');
        success();
    } else {
        console.log("check" + dirPath);
        if(mkdirsSync(dirPath)) {
            success();
            console.log('更新目录已创建成功\n');            
        }
    }
}

app.get('/index.html', function(req, res) {
    console.log("get index");
    res.sendFile( __dirname + "/" + "index.html" );
});

// /[image]+\/\d+\/\d+\/\d+@\w+.\w+/
app.get(/[image]+\/\d\d\d\d\/\d+\/\d+@\w+.\w+/, function(req, res) {
    console.log("get jpg " + req.path);
    //上传的图片不要有中文
    res.sendFile(__dirname + "/" + req.path);
});

app.get('/list', function(req, res) {
    console.log("get pic url list");
    res.send(JSON.stringify(urlArrary));
});

app.post('/file_upload', function (req, res) {
   debugger;
   var form = new formidable.IncomingForm();
   form.uploadDir = __dirname + "/image";
   form.keepExtensions = true;

   form.on('fileBegin', function(name, file) {
       //在这个时间触发后，文件已经被存储到文件系统中了。
       var now = new Date();
       file.name = now.getTime() + "@" + file.name;
       file.path = __dirname + "/image/" + file.name;
       var tPath = __dirname + "/" + getBaseDir().toString();
    // var tPath = "test\\test1";    
       //console.log(tPath);
       checkDirAndFile(tPath, function() {
           file.path = tPath + "/" + file.name;
           urlArrary.push(baseUrlOfPic + getBaseDir().toString() + "/" + file.name);
           console.log(urlArrary);
       });
       //console.log("I'm on fileBegin " + JSON.stringify(file));
   });

   form.on('file', function(field, file) {
   //rename the incoming file to the file's name
    //fs.rename(file.path, __dirname + "\\image\\" + file.name);
    //console.log("I'm on file " + JSON.stringify(file));
   });

   form.parse(req, function(err, fields, files) {
      //console.log("I'm parse " + JSON.stringify(files));
    }
    );
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})