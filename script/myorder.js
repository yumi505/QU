var redirect_uri = encodeURIComponent(location.href);
var getOrdersUrl = xq.xqAPI + 'order/my/list';
var wxAuthorUrl = xq.xqAPI + 'token/wx/create';
var tokenApiUrl = xq.xqAPI + 'token/create';

var app = new Vue({
    el:'#myApp',
    data:{
        orderList:[],
        wxCode:'',
        wxOpenId:'',
        wxAccessToken:'',
        apiToken:''//接口授权 apiToken
    },
    methods:{
        markStatus:function(param){
            var statusClass = '';
            switch(param){
                case 1:/*待老师接单、已完成：待开班（灰色）  */
                    statusClass = 'dkb';
                    break;
                case 2:/* 待选择老师、待支付：待支付（黄色）*/
                    statusClass = 'dzf';
                    break;
                case 3: /* 待上课、上课中：上课中（绿色）*/
                    statusClass = 'skz';
                    break;
                case 4: /* 已完成*/
                    statusClass = 'ywc';
                    break;
                case 5: /* 已取消：已取消（红色）*/
                    statusClass = 'yqx';
                    break;
            }
            return statusClass;
        },
        getOrders:function(orderType){
            $.showIndicator();
            getMyOrders(orderType);
        }
    }
});

function wechatLinkJump(){
    var wechatLink = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+xq.gzhAppId+"&redirect_uri="+
    redirect_uri+"&response_type=code&scope=snsapi_base&state=123#wechat_redirect";

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
        console.log(err);
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
            $.showIndicator();
            getMyOrders(0);
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function getMyOrders(orderType){
    var orderListPara = {
        'orderType':0, //0: 全部, 1: 拼班, 2: 一对一
        'orderBigStatus':orderType, // 订单大状态(0: 全部, 1: 待处理, 2: 进行中, 3: 已完成)
        'count':30,  //返回的数据行数
        'firstId':null, // 返回firstId之前的数据
        'lastId':null, //返回lastId之后的数据
        'timestamp':new Date().getTime(),
        'appId':xq.appId
    };

    var sign = xq.signCoputed(orderListPara);
    orderListPara.sign = sign;
    axios.defaults.headers.common['Authorization'] = "Bearer " + sessionStorage.getItem('apiToken');

    axios.get(getOrdersUrl,{params:orderListPara}).then(function(res){
        if(res.data.code == 200){
            $.hideIndicator();
            console.log(res.data.data);
            app.orderList = res.data.data;
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
        getMyOrders(0);
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

getUrlCode();