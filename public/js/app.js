var HRS = angular.module('HRS', ['ngRoute', 'datatables', 'chieffancypants.loadingBar'], function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
});

HRS.config(['$routeProvider', '$locationProvider',function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/out', {
            templateUrl: 'out.html',
            controller: 'ReferralCtrl as R'
        })
        .when('/in', {
            templateUrl: 'in.html',
            controller: 'ReferralCtrl as R'
        })
        .when('/hospital', {
            templateUrl: 'hospital.html',
            controller: 'HospitalCtrl as H'
        })
        .when('/referral', {
            templateUrl: 'referral.html',
            controller: 'ReferralCtrl as R'
        })
        .otherwise({
            redirectTo: '/referral'
        });

    $locationProvider.html5Mode(false);
}])

var url = 'http://'+window.location.host;
//var url = 'http://localhost:3000';

var tableLanguge = {
    "lengthMenu": "每页显示 _MENU_ 条记录",
    "zeroRecords": "- 没有相关记录 -",
    "info": "_PAGE_ / _PAGES_ 总共 _TOTAL_ 条",
    "infoEmpty": "0 / 0",
    "infoFiltered": "(从 _MAX_ 条记录里面筛选到 _TOTAL_ 条记录)",
    "search" : "筛选",
    "paginate" : {
        "previous" : "<i class='icon-backward'></i>"
        ,"next" : "<i class='icon-forward'></i>"
        ,"first" : "<i class='icon-step-backward'></i>"
        ,"last" : "<i class='icon-step-forward'></i>"
    }
};


//login crtl

HRS.controller('HospitalCtrl', ['$http' , '$scope', 'DTOptionsBuilder', 'DTColumnDefBuilder',function($http , $scope, DTOptionsBuilder, DTColumnDefBuilder){
    var self = this;
    self.editIndex = -1;
    self.info = {};
    self.items = new Array();
    self.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('aLengthMenu', [[10, 20, 50, -1], [10, 20, 50, 'All']]) // Length of how many to show per pagination.
        .withOption('language', tableLanguge)
        .withOption('stateSave', false)
        .withPaginationType('full_numbers')
        .withBootstrap();

    self.dtColumns = [
        DTColumnDefBuilder.newColumnDef(0)
        ,DTColumnDefBuilder.newColumnDef(1)
        ,DTColumnDefBuilder.newColumnDef(2)
        ,DTColumnDefBuilder.newColumnDef(3)
        ,DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];

    self.save = function() {
        $http['post'](url+'/hospital', {hospital:self.info}).success(function(result){
            self.items.push(result);
            for(var k in self.info) {
                self.info[k] = '';
            }
        });
    }

    self.remove = function(index) {
        $http['delete'](url+'/hospital?id='+self.items[index]._id).success(function(result){
            self.items.splice(index, 1);
        });
    }

    self.modify = function(index) {
        self.editIndex = index;
        self.info = self.items[index];
    }

    self.update = function() {
        $http['put'](url + '/hospital?id=' + self.info._id, {hospital: self.info}).success(function (result) {
            self.items[self.editIndex] = self.info;
            self.editIndex = -1;
            delete self.info;
        });
    }

    $http['get'](url + '/hospital')
        .success(function (docs) {
            self.items = docs;
        })
        .error(function(data,header,config,status){
            console.log(status);
        });
}]);

HRS.controller('ReferralCtrl', ['$location','$route','$http' , '$scope', 'DTOptionsBuilder', 'DTColumnDefBuilder',function($location,$route,$http , $scope, DTOptionsBuilder, DTColumnDefBuilder){
    var self = this;
    self.info = {};

    self.items = new Array();
    
        
    self.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('aLengthMenu', [[10, 20, 50, -1], [10, 20, 50, 'All']]) // Length of how many to show per pagination.
        .withOption('language', tableLanguge)
        .withOption('stateSave', false)
        .withOption('order',[[8,'desc']])
        .withPaginationType('full_numbers')
        .withBootstrap();

    self.dtColumns = [
        DTColumnDefBuilder.newColumnDef(0)
        ,DTColumnDefBuilder.newColumnDef(1)
        ,DTColumnDefBuilder.newColumnDef(2)
        ,DTColumnDefBuilder.newColumnDef(3)
        ,DTColumnDefBuilder.newColumnDef(4)
        ,DTColumnDefBuilder.newColumnDef(5)
        ,DTColumnDefBuilder.newColumnDef(6)
        ,DTColumnDefBuilder.newColumnDef(7).notSortable()
        ,DTColumnDefBuilder.newColumnDef(8).notVisible()
    ];

    $http['get'](url+'/referral?type='+type).success(function (docs) {
        self.items = docs;
        console.log(self.items);
        if(docs.length > 0) {
            $scope.lastGet = (new Date()).getTime();
        } 
    });



    $http['get'](url + '/hospital').success(function (docs) {
        self.hospital = docs;
        if(type == 'in') {
                if(!$scope.lastGet) return;
                $http['get'](url+'/referral?type='+type+'&dt='+$scope.lastGet).success(function (docs) {
                    var arr = self.items;
                    for(var i in docs) {
                        arr.push(docs[i]);
                    }
                    self.items = arr;
                    if(docs.length > 0) {
                        $scope.lastGet = (new Date()).getTime();
                    }
                });
        }
    });

    self.save = function() {
        $http['post'](url+'/referral', {referral:self.info}).success(function(result){
            self.items.push(result);
            for(var k in self.info) {
                self.info[k] = '';
            }
        });
        return $scope.$emit('to-parint',self.items);
    }

    self.remove = function(index) {
        $http['delete'](url+'/referral?id='+self.items[index]._id).success(function(result){
            self.items.splice(index, 1);
        });
        $route.reload();
    }
    self.accept = function(index){
        $http['put'](url+'/referral?id='+self.items[index]._id).success(function(result){
            self.items[index].status = result;
        })
    }
    self.reject = function(index){
        $http['get'](url+'/referral?id='+self.items[index]._id).success(function(result){
            self.items[index] = result;
        })
    }
}]);
// 父级 controller
HRS.controller('RootCtrl',['$scope',function($scope){
    $scope.$on('to-parint',function(e,items){
        $scope.$broadcast('to-child',items);
    })
    return;
}])
// 消息弹出控制
HRS.controller('AlertDemoCtrl',['$scope','$http',function($scope,$http){
    var self = this;
    self.items = new Array();
    $scope.alert ={msg:'有一名新的病例转入,是否要接收呢?'};
    $scope.visible = true;
    $scope.$on('to-child',function(e,items){
        $scope.$watch('items',function(){
                console.log(items);
                $scope.visible = true;
        },true);
    });
    
  self.Accept = function(index){
   $http['put'](url+'referral?id'+self.items[index]._id).success(function(){

            })
  };
  self.Refuse = function(index){
   
  };
 
  self.closeAlert = function() {
    $scope.visible = false
  }
}]);

function setNav(idx){
    $('.navbar-nav li').removeClass('active');
    $('.navbar-nav li').eq(idx).addClass('active');
}

$(document).ready(function(){
    $('.navbar-nav li').click(function(){
        $('.navbar-nav li').removeClass('active');
        $(this).addClass('active');
    });
});