(function($){
    $.extend({
        ZCountdown: function(options) {
            var defaults = {
                className: 'ZCountdown', //设置需要执行元素的className
                endTime: '2017/12/21 00:00:00', //设置倒计时的目标时间
                saveDay: false, //设置当倒计时时间小于一天后是否保留day
                showDay: true, //设置受否显示天
                showHour: true, //设置受否显示小时
                showMin: true, //设置受否显示分钟
                showSec: true, //设置受否显示秒
                txtDay: '天', //设置day的单位
                txtHour: '时', //设置hour的单位
                txtMin: '分', //设置min的单位
                txtSec: '秒', //设置sec的单位
                callback: null //倒计时结束后的回调函数
            };
            var opts = jQuery.extend(defaults, options);
            var method = {
                countDown: function(className, endTime, callback) {
                    var obj = jQuery(className);
                    var end_time = new Date(endTime).getTime(),
                        sys_second = (end_time - new Date().getTime()) / 1000;
                    var timer = setInterval(function() {
                        var html = '';
                        if (sys_second > 2) {
                            sys_second -= 1;
                            var day = Math.floor(sys_second / 3600 / 24);
                            var hour = Math.floor(sys_second / 3600 % 24);
                            hour = hour < 10 ? '0' + hour : hour;
                            var minute = Math.floor(sys_second / 60 % 60);
                            minute = minute < 10 ? '0' + minute : minute;
                            var second = Math.floor(sys_second % 60);
                            second = second < 10 ? '0' + second : second;
                            if (opts.showDay && (day > 0 || opts.saveDay)) {
                                html += '<span class="type type-day"><em class="day">' + day + '</em><span class="unit">' + opts.txtDay + '</span></span>';
                            };
                            if (opts.showHour) {
                                html += '<span class="type type-hour"><em class="hour">' + hour + '</em><span class="unit">' + opts.txtHour + '</span></span>';
                            };
                            if (opts.showMin) {
                                html += '<span class="type type-min"><em class="min">' + minute + '</em><span class="unit">' + opts.txtMin + '</span></span>';
                            };
                            if (opts.showSec) {
                                html += '<span class="type type-sec"><em class="sec">' + second + '</em><span class="unit">' + opts.txtSec + '</span></span>';
                            };
                            obj.html(html);
                        } else {
                            clearInterval(timer);
                            if (typeof callback == 'function') {
                                callback();
                            };
                        }
                    }, 1000);
                }
            }
            return method.countDown(opts.className, opts.endTime, opts.callback);
        }
    });
})(jQuery);

var redirect_uri = encodeURIComponent(location.href);
var orderDetailUrl = xq.xqAPI + 'parents/order/oto/detail';
var cancelOrderUrl = xq.xqAPI + 'parents/order/oto/cancel';
var tokenApiUrl = xq.xqAPI + 'token/create';
var wxAuthorUrl = xq.xqAPI + 'token/wx/create';

var app = new Vue({
    el:'#myApp',
    data:{
        bookTime:'',
        hobbyName:'',
        classesType:'',
        studentCount:0,
        address:'',
        orderStatus:'',
        orderStatusValue:0,
        recommendNum:66,
        orderTime:'',
        cancelReason:'',
        wxAccessToken:'',
        wxOpenId:'',
        accessToken:'',
        wxCode:''
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
        cancelOrder:function(){
            cancelOrder();
        }
    },
    computed:{
        bookedMonth:function(){
            var date = new Date(this.bookTime);
            var month = date.getMonth()+1;
            return month;
        },
        bookedDay:function(){
            var date = new Date(this.bookTime);
            var day = date.getDate()+1;
            return day;
        },
        bookedTime:function(){
            var date = new Date(this.bookTime);
            var time = date.getHours() + ":" + date.getMinutes();
            return time;
        },
        bookedWeek:function(){
            var date = new Date(this.bookTime);
            var week = date.getDay();
            switch(week){

            }
            return time;
        }
    }
});

function wechatLinkJump(){
    var wechatLink = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+xq.gzhAppId+"&redirect_uri="+
    redirect_uri+"&response_type=code&scope=snsapi_base&state=123#wechat_redirect";

    location.href = wechatLink;
}

function timeCountDown(orderTime){
    $.ZCountdown({
        className: '.ZCountdown',
        endTime: orderTime
    });
}

function getOrderDetail(){
    var orderParam = {
        "orderId":xq.getUrlParam('orderId'),
        "timestamp": new Date().getTime(),
        "appId": xq.appId
    };

    var sign = xq.signCoputed(orderParam);
    orderParam.sign = sign;

    axios.defaults.headers.common['Authorization'] = "Bearer " + sessionStorage.getItem('accessToken');
    axios.get(orderDetailUrl,{params:orderParam}).then(function(res){
        if(res.data.code == 200){
            //app.orderDetail = res.data.data[0];
            app.bookTime = res.data.data[0].title;
            app.hobbyName = res.data.data[0].hobbyName;
            app.classesType = res.data.data[0].classesType;
            app.studentCount = res.data.data[0].studentCount;
            app.address = res.data.data[0].address;
            app.orderStatus = res.data.data[0].orderStatus;
            app.orderStatusValue = res.data.data[0].orderStatusValue;
            app.orderTime = res.data.data[0].orderTime;
            app.cancelReason = res.data.data[0].cancelReason;

            if(res.data.data[0].recommendNum){
                app.recommendNum = res.data.data[0].recommendNum;
            }

            timeCountDown(res.data.data[0].orderTime);
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function cancelOrder(){
    var cancelParam = {
      "orderId": xq.getUrlParam('orderId'),
      "cancelReason": "家长发布后自己取消",
      "timestamp": new Date().getTime(),
      "appId": xq.appId
    };

    var sign = xq.signCoputed(cancelParam);
    cancelParam.sign = sign;

    axios.defaults.headers.common['Authorization'] = "Bearer " + sessionStorage.getItem('accessToken');
    axios.post(cancelOrderUrl,cancelParam).then(function(res){
        if(res.data.code == 200){
            $.toast('订单已取消');
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
            app.accessToken = res.data.data[0].accessToken;
            sessionStorage.setItem('accessToken',res.data.data[0].accessToken);
            $.showIndicator();
            getOrderDetail();
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
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

            sessionStorage.setItem('wxOpenId',res.data.data[0].openId);
            sessionStorage.setItem('wxAccessToken',res.data.data[0].accessToken);
            sessionStorage.setItem('expiresIn',res.data.data[0].expiresIn);
            sessionStorage.setItem('sessionTimeStamp', new Date()*1);

            creatToken();
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function getUrlCode(){
    var wxAccessToken = sessionStorage.getItem('wxAccessToken');
    var wxOpenId = sessionStorage.getItem('wxOpenId');
    var sessionTimeStamp = sessionStorage.getItem('sessionTimeStamp');
    var expiresIn = sessionStorage.getItem('expiresIn');

    var expiresTime = (new Date()*1) - parseInt(sessionTimeStamp,10);
    expiresTime = expiresTime/1000 ;

    //有 wxAccessToken 且在有效期内（expiresIn:7200秒）
    if(wxAccessToken && expiresTime < parseInt(expiresIn,10)){
        app.wxAccessToken = wxAccessToken;
        app.wxOpenId = wxOpenId;
        creatToken();
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

