var redirect_uri = encodeURIComponent(location.href);
var wxAuthorUrl = xq.xqAPI + 'token/wx/create';
var tokenApiUrl = xq.xqAPI + 'token/create';
var saveInfoApiUrl = xq.xqAPI + 'parents/account/save';
var getInfoApiUrl = xq.xqAPI + 'parents/account/current';

var app = new Vue({
    el:'#myApp',
    data:{
        student_sex:'boy',
        birthday:'',
        defaultAddress:'',
        noteTxt:'',
        apiToken:'',
        wxCode:'',
        wxOpenId:'',
        wxAccessToken:''
    },
    methods:{
        studentSex:function(gender){
            this.student_sex = gender == 0?'boy':'girl';
        },
        saveInfo:function(){
            var param={
                'studentSex': this.student_sex === 'boy'?0:1,
                'studentBirthday':'',
                'address':this.defaultAddress,
                'remark':this.noteTxt,
                'timestamp':new Date().getTime(),
                'appId':xq.appId
            };

            param.studentBirthday = $("#datetime-picker").val();

            if(param.studentBirthday === ''){
                $.toast('请选择生日');
                return;
            }
            
            if(param.address === ''){
                $.toast('请输入常用地址');
                return;
            }

            if(param.remark === ''){
                $.toast('请输入备注');
                return;
            }

            var sign = xq.signCoputed(param);
            param.sign = sign;

            axios.defaults.headers.common['Authorization'] = "Bearer " + app.apiToken;

            var that = this;
            axios.post(saveInfoApiUrl,param).then(function(res){
                if(res.data.code == 200){
                    $.toast('保存成功');
                    //获取用户信息
                    that.getStudentInfo(); 
                }else{
                    $.toast(res.data.message);
                }
            }).catch(function(err){
                console.log(err);
            });
        },
        getStudentInfo:function(){
            axios.defaults.headers.common['Authorization'] = "Bearer " + app.apiToken;
            var that = this;
            axios.get(getInfoApiUrl,null).then(function(res){
                if(res.data.code == 200){
                    that.student_sex = res.data.data[0].studentSexValue == 0?'boy':'girl';
                    that.defaultAddress = res.data.data[0].address;
                    that.noteTxt = res.data.data[0].remark;
                    //转换生日日期
                    that.dateFormat(res.data.data[0].studentBirthday);
                }else{
                    $.toast(res.data.message);
                }
            }).catch(function(err){
                console.log(err);
            });
        },
        dateFormat(time){
            var date = new Date(time*1000),
                year = date.getFullYear(),
                month = date.getMonth()+1,
                day = date.getDate();
            
            if(month < 10){
                month = '0' + month; 
            }
            
            this.birthday = year + '-' + month + '-' + day;

            $("#datetime-picker").val(this.birthday);
        }
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
            //尝试获取用户信息
            app.getStudentInfo();
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
        //尝试获取用户信息
        app.getStudentInfo();
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

$(function(){
    //日历选择器
    $("#datetime-picker").calendar();

    $.init(); 

    getUrlCode();
});



