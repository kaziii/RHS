var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var app = express();
var router = express.Router();

//mongoose model
mongoose.connect('mongodb://localhost:27017/HRSDB');
app.on('close', function(errno) {
    mongoose.disconnect();
});
var Hospital = mongoose.model('Hospital',
    {
        sn : String, //医院编号
        pwd : String,//密码
        name: String,//医院名字
        telphone: Number,     //联系方式
        createTime: Date,     //创建时间
        lastModifyTime:Date,   //最后修改时间
    });

var Referral = mongoose.model('Referral',
    {
        name : String, //转诊病人名字
        age : Number, //转诊病人年龄
        telphone:Number, //转诊病人联系方式
        doctor : String, //转诊医生
        type : String, //转诊类别
        desc : String, //备注
        createTime: Number,
        from : String,
        to : String,
        status : String
    });
/* GET home page. */
router.all('/', function(req, res){
      var type = req.method.toLowerCase();
        if(type == 'post'){
            Hospital.findOne({sn:req.body['sn'],pwd:req.body['pwd']},function(err, docs){
                if(err) {
                    console.log(err);
                    res.render('error',{});
                } else {
                    if(docs) {
                        res.render('default',{});
                        console.log("登录成功");
                        res.cookie.user = req.body['sn'];
                        res.cookie.password = req.body['pwd']
                    }else {
                        res.redirect('/');
                        console.log("登录错误");
                    }
                    
                }
            });
        } else {
            if(!req.session.user) {
                res.sendFile(path.join(__dirname,'../public/login.html'));
                return;
            }
            res.sendFile(path.join(__dirname,'../public/default.html'));
        }
});
router.all('/hospital', function(req, res){
    var type = req.method.toLowerCase();
    switch(type) {
        case 'post' : {
            var hp = req.body.hospital;
            hp.createTime = new Date();
            var hospital = new Hospital(hp);
            Hospital.find({sn:hp.sn}, function(err,docs){
                if(docs.length <= 0) {
                    hospital.save(function(err, docs){
                        if(err) {
                            res.send(err);
                        } else {
                            res.send(docs);
                        }
                    });
                } else {
                    //编号已存在
                }
            });
            break;
        }
        case 'put' : {
            var id = req.query['id'];

            var update = req.body.hospital;
            Hospital.find({sn:update.sn, _id : {$ne:update._id}}, function(err,docs){
                if(docs.length <= 0) {
                    delete update._id;
                    delete update.__v;
                    update.lastModifyTime = new Date();
                    update.$inc = {__v : 1};
                    Hospital.findOneAndUpdate({_id: id}, update, function(err, doc){
                        if(err) {
                            res.send(err);
                        } else {
                            res.send(doc);
                        }
                    });
                } else {
                    //编号已存在 3
                }
            });

            break;
        }
        case 'delete' : {
            var id = req.query['id'];
            Hospital.findByIdAndRemove(id, function(err){
                if(err) {
                    res.send(err);
                } else {
                    res.send('ok');
                }
            });
            break;
        }
        default : {
            Hospital.find(function(err, docs){
                if(err) {
                    res.send(err);
                } else {
                    res.send(docs);
                }
            });
            break;
        }
    }
});

router.all('/referral', function(req, res){ 
    var type = req.method.toLowerCase();

    switch(type) {
        case 'post' : {
            var rf = req.body.referral;
            rf.createTime = (new Date()).getTime();
            rf.status = '未接收';
            rf.from = '测试转入医院';
            var referral = new Referral(rf);
            referral.save(function(err, docs){
                if(err) {
                    res.send(err);
                } else {
                    res.send(docs);
                }
            });
            break;
        }
        case 'put' : {

            break;
        }
        case 'delete' : {
            var id = req.query['id'];
            Referral.findByIdAndRemove(id, function(err){
                if(err) {
                    res.send(err);
                } else {
                    res.send('ok');
                }
            });
            break;
        }
        default : {
            var type = req.query['type'];
            var opt = {};
            if(type == 'in') {
                opt.to = '成都双楠医院';
            }
            if(type == 'out') {
                opt.from = '测试转入医院';
            }
            if(req.query['dt']){
                opt.createTime = {$gt:Number(req.query['dt'])};
            }
            console.log(opt);
            Referral.find(opt, function(err, docs){
                if(err) {
                    console.log(err);
                    res.send(err);
                } else {
                    console.log(docs);
                    res.send(docs);
                }
            });
            break;
        }
    }
});

module.exports = router;
