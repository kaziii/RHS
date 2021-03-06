var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var Schema = mongoose.Schema;
var app = express();
var router = express.Router();

//mongoose model
mongoose.connect('mongodb://localhost:27017/HRSDB');
app.on('close', function(errno) {
    mongoose.disconnect();
});
var HospitalSchema = new Schema({
        sn : String, //医院编号
        pwd : String,//密码
        name: String,//医院名字
        telphone: Number,     //联系方式
        createTime: Date,     //创建时间
        lastModifyTime:Date,   //最后修改时间
        referral:[{type:Schema.Types.ObjectId, ref:'Referral'}]
});

var ReferralSchema = new Schema({
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
var Referral = mongoose.model('Referral',ReferralSchema);
var Hospital = mongoose.model('Hospital',HospitalSchema);

/* GET home page. */
router.all('/', function(req, res){
      var type = req.method.toLowerCase();
      var user = {sn:req.body['sn'],pwd:req.body['pwd']};
        if(type == 'post'){
            Hospital.findOne(user,function(err, docs){
                if(err) {
                    console.log(err);
                    res.render('error',{});
                } else {
                    if(docs) {
                        res.render('default',{});
                        console.log("登录成功");
                        req.session.user = user;
                        console.log(req.session.user)
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
            console.log(req.session.user)
        }
});
router.all('/hospital', function(req, res){
    if(!req.session.user) {
                res.sendFile(path.join(__dirname,'../public/login.html'));
                return;
            }
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
            var hospital_msg = {
                sn : Hospital.sn ,
                pwd : Hospital.pwd,
                name: Hospital.name,
                telphone:Hospital.telphone,
                createTime:Hospital.createTime,
                lastModifyTime:Hospital.lastModifyTime
            }
            Hospital.find([hospital_msg],function(err, docs){
                if(err) {
                    res.send(err);
                } else {
                    res.send(docs);
                    console.log(docs)
                }
            });
            break;
        }
    }
});

router.all('/referral', function(req, res){
    if(!req.session.user) {
                res.sendFile(path.join(__dirname,'../public/login.html'));
                return;
            }
    var type = req.method.toLowerCase();
    switch(type) {
            case 'post' : {
                var rf = req.body.referral;
                rf.createTime = (new Date()).getTime();
                rf.status = '未接收';
                rf.from = '测试转入医院';
                var referral = new Referral(rf);
                referral.save(function(err,doc){
                    if(err) return res.send(doc);
                        Hospital.findOne({sn:req.session.sn},{'$push':{'referral':{'id':doc._id}}},function(err,referral){
                            if(err) return res.send(docs);console.log(docs);
                            })
                        })
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
                
                // 子母表查询 populate()
                Referral.find({sn:req.session.user.sn}).populate("referral").exec(function(err, docs){
                   if (err) {
                    res.send(err);
                   } else {
                    return res.send(docs);
                    console.log(docs);
                   } 
                });
                break;
            }
        }
    });

module.exports = router;
