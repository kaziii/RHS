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
        referral:[{type:Schema.Types.ObjectId, ref:'Referral'}],  //转出病例
        intoreferral:[{type:Schema.Types.ObjectId,ref:'Referral'}], //转入病例
        intolength:String, //截止注销用户时所有转入病例
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
        if(type == 'put') {
            res.send(req.session.user.name);
            console.log(req.session.user.name);
            return;
        }
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
                        req.session.user.name = docs.name;
                        req.session.user.id = docs._id; 
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
            }else{
                res.sendFile(path.join(__dirname,'../public/default.html'));
                return;    
            } 
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
            Hospital.find(function(err, docs){
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
                rf.from = req.session.user.name;
                var referral = new Referral(rf);
                referral.save(function(err,doc){
                    if(err) return res.send(doc);console.log(doc);
                        Hospital.update({sn:req.session.user.sn},{'$push':{'referral':doc._id}},function(err,docs){
                                if(err) return ;
                                var to = doc.to;
                                Hospital.update({name:to},{'$push':{'intoreferral':doc._id}},function(err,docs){
                                    if(err) return ;

                                })
                            })
                        })
                break;
            }
            // 根据id找到文档 根据from 存入intoreferral
            case 'put' :{
                var id =req.query['id'];
                var st = req.body.status;
                Referral.update({_id:id},{$set:{"status":st}},function(err,docs){
                    if(err) {
                        res.send(err);
                        console.log(err);
                    } else {
                        res.send(docs.status);
                        console.log(docs.status);
                        console.log(docs);
                    }
                })
                break;
            }
            // 删除 hospital 中referral 中的id使其 referral任然存在 并被其他账户读取到 
            case 'delete' : {
                var id = req.query['id'];
                var _id = req.session.user.id;
                Hospital.update({_id:_id},{$pull:{'referral':id}},function(err,docs){
                    if(err) {
                        res.send(err);
                        console.log(err);
                    } else {
                        res.send("ok");
                        console.log(id);
                        console.log(docs);
                    }
                })
                break;
            }
            // 自定义referral 页面 IN OR OUT 的默认值
            default : {
                var type = req.query['type'];
                if(type == 'add') {
                    Hospital.findOne({sn:req.session.user.sn},function(err,docs){
                        if(err) return 
                            console.log(docs);
                            res.send(docs);
                    })
                    break;
                }
                if(type == 'out') {
                    Hospital.findOne({sn:req.session.user.sn}).populate('referral').exec(function(err, docs){
                        if (err) {
                            res.send(err);
                            console.log(err);
                        } else {
                            res.send(docs.referral);
                            console.log(docs.referral);
                        }
                    });
                    break;
                }
                if(type == 'in') {
                    Hospital.findOne({sn:req.session.user.sn}).populate('intoreferral').exec(function(err,docs){
                        if(err) return 
                            res.send(docs.intoreferral);
                            console.log(docs.intoreferral);
                    });
                    break;
                }
            }
        }
    });

router.all('/logout',function(req,res){
    res.redirect('/');
    delete req.session.user;
    Hospital.findOneAndUpdate({_id:req.session.user.id},function(err,docs){
        if(err) {
            res.send(err);
        } else {
            db.Hospital.update({_id:req.session.user.id},{$set:{'intolength':docs.intoreferral.length}});
            console.log(docs.intolength);
        }
    });
})
module.exports = router;
