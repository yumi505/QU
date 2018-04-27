var redirect_uri = encodeURIComponent(location.href);
var wxAuthorUrl = xq.xqAPI + 'token/wx/create';
var tokenApiUrl = xq.xqAPI + 'token/create';
var getAccountInfoUrl = xq.xqAPI + 'parents/account/current';


var app = new Vue({
    el:'#myApp',
    data:{
        apiToken:'',
        wxCode:'',
        wxOpenId:'',
        wxAccessToken:'',
        avatarThumbnailUrl:'',
        nickName:'' ,
        phoneNumber :''   
    },
    methods:{
         
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
            getAccountInfo();
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function getAccountInfo(){
    axios.defaults.headers.common['Authorization'] = "Bearer " + app.apiToken;

    var param = {};

    axios.get(getAccountInfoUrl,{params:param}).then(function(res){
        if(res.data.code == 200){
            var map = res.data.data[0];
            app.avatarThumbnailUrl = map.avatarThumbnailUrl.split('@')[0];
            app.nickName = map.nickName;
            app.phoneNumber = map.phoneNumber;
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
        getAccountInfo();
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

function _pageInit(){
    getUrlCode();
}

_pageInit();