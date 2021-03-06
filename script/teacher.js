﻿var redirect_uri = encodeURIComponent(location.href);
var wxAuthorUrl = xq.xqAPI + 'token/wx/create';
var tokenApiUrl = xq.xqAPI + 'token/create';
var getTeacherDetail = xq.xqAPI + 'parents/teacher/detail';
var chooseTeacher = xq.xqAPI + 'parents/order/oto/choose';

var teacherId = xq.getUrlParam('tid');
var orderId = xq.getUrlParam('orderId');

var app = new Vue({
    el:'#myApp',
    data:{
        apiToken:'',//接口授权 apiToken
        wxCode:'',
        wxOpenId:'',
        wxAccessToken:'',
        avatarId:'',
        avatarUrl:'',
        trueName:'',
        sex:'',
        sexValue:0,
        birthday: 0,
        birthdayFormat: '',
        address: '',
        lngX: 0,
        latY: 0,
        personalProfile:'',
        identityType:'',
        identityTypeValue: 0,
        isCertify: 0,
        userId:'',
        phoneNumber: '',
        email:''
    },
    methods:{
        selectTeacher:function (){
            axios.defaults.headers.common['Authorization'] = "Bearer " + this.apiToken;

            var chooseParam = {
                "orderId":orderId,
                "teacherId": teacherId,
                "timestamp":new Date().getTime(),
                "appId": xq.appId

            };

            var sign = xq.signCoputed(chooseParam);
            chooseParam.sign = sign;

            axios.post(chooseTeacher,chooseParam).then(function(res){
                if(res.data.code == 200){
                    var gotoUrl = "order_1.html?orderId="+orderId+"&selectTid="+teacherId;
                    location.href = gotoUrl;  
                }else{
                    $.toast(res.data.message);    
                }
            });
        }   
    },
    computed:{
        
    }
});

function wechatLinkJump(){
    var wechatLink = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+xq.gzhAppId+"&redirect_uri="+
    redirect_uri+"&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect";

    location.href = wechatLink;
}

function wechatAuth(){
    var wechatAuthPara = {
        "appSecret": xq.app_secret,
        "timestamp": new Date().getTime(),
        "appId": xq.appId,
        "code": app.wxCode
    };

    var sign = xq.signCoputed(wechatAuthPara);
    wechatAuthPara.sign = sign;

    axios.post(wxAuthorUrl,wechatAuthPara).then(function(res){
        if(res.data.code == 200){
            app.wxOpenId = res.data.data[0].openId;
            app.wxAccessToken = res.data.data[0].accessToken;
            creatToken();
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err)
    });
}

function creatToken(){
    var tokenPara = {
        "userName": app.wxOpenId,
        "password": app.wxAccessToken,
        "validType": 3, //Auth验证
        "authType": 1, //微信认证
        "appSecret": xq.app_secret,
        "timestamp": new Date().getTime(),
        "appId": xq.appId
    };

    var sign = xq.signCoputed(tokenPara);
    tokenPara.sign = sign;

    axios.post(tokenApiUrl,tokenPara).then(function(res){
        if(res.data.code == 200){
            app.apiToken = res.data.data[0].accessToken;
            sessionStorage.setItem('apiToken',res.data.data[0].accessToken);
            getTeachDetail();
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function getTeachDetail(){
    axios.defaults.headers.common['Authorization'] = "Bearer " + app.apiToken;

    var teacherParam = {
        'teacherId': teacherId,
        'timestamp': new Date().getTime(),
        'appId': xq.appId
    };

    var sign = xq.signCoputed(teacherParam);
    teacherParam.sign = sign;

    axios.get(getTeacherDetail,{params:teacherParam}).then(function(res){
        if(res.data.code == 200){
            app.avatarId = res.data.data[0].avatarId;
            app.avatarUrl = res.data.data[0].avatarUrl;
            app.trueName = res.data.data[0].trueName;
            app.sex = res.data.data[0].sex;
            app.sexValue = res.data.data[0].sexValue;
            app.birthday = res.data.data[0].birthday;
            app.birthdayFormat = res.data.data[0].birthdayFormat;
            app.address = res.data.data[0].address;
            app.lngX = res.data.data[0].lngX;
            app.latY = res.data.data[0].latY;
            app.personalProfile = res.data.data[0].personalProfile;
            app.identityType = res.data.data[0].identityType;
            app.identityTypeValue = res.data.data[0].identityTypeValue;
            app.isCertify = res.data.data[0].isCertify;
            app.userId = res.data.data[0].userId;
            app.phoneNumber = res.data.data[0].phoneNumber;
            app.email = res.data.data[0].email;
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function getUrlCode(){
    var apiToken = sessionStorage.getItem('apiToken');
     
    if(apiToken){
        app.apiToken = apiToken;
        getTeachDetail();
    }else{
        var wechatCode = xq.getUrlParam('code');
        if(wechatCode){
            app.wxCode = wechatCode;
            wechatAuth();
        }else{
          wechatLinkJump();  
        } 
    }
}

window.addEventListener("popstate", function(e) { 
    var deferrer = "order_1.html?orderId="+orderId;
    location.href = deferrer;
}, false);

function pushHistory() { 
    var state = { 
        title: "title", 
        url: "#" 
    }; 
    window.history.pushState(state, "title", "#"); 
}

function _pageInit(){
    getUrlCode();
    pushHistory();
}
_pageInit();

