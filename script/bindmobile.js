var sendApiUrl = xq.xqAPI + 'sms/send';
var bindMobileApiUrl = xq.xqAPI + 'parents/account/bindphone';

var app = new Vue({
    el:'#myApp',
    data:{
        //输入的账号/手机号(登录注册时)
        mobileInpVal: '',
        //输入的验证码(注册时)
        yzCodeInpVal: '',
        //显示验证码倒计时
        yzCodeTxt: '验证码',
        //是否正在倒计时
        isCountign: false
    },
    methods:{
        //发送验证码
        sendYzCode: function(num) {
            if (this.isCountign) { return; }

            if (checkMobileBeforeSendCode()) {
                this.isCountign = true;
                var that = this;
                var initSecend = parseInt(num, 10);
                this.isCountign = true;
                that.yzCodeTxt = initSecend + 'S';

                clearInterval(interval);
                var interval = setInterval(function() {
                    initSecend--;
                    if (initSecend == -1) {
                        that.yzCodeTxt = '验证码';
                        clearInterval(interval);
                        that.isCountign = false;
                        return;
                    }
                    var txt = initSecend + 'S';
                    that.yzCodeTxt = txt;
                }, 1000);
            }
        },
        submitBindMobile:function(){
            var bindPara = {
              "phoneNumber": this.mobileInpVal,
              "verifyCode": this.yzCodeInpVal?this.yzCodeInpVal:"111111",
              "timestamp": new Date().getTime(),
              "appId": xq.appId
            };

            if(bindPara.phoneNumber == ''){
                $.toast('请输入手机号');
                return;
            }else{
                if (!xq.isPhone(bindPara.phoneNumber)) {
                    $.toast('手机号格式不正确');
                    return;
                }
            }

            if(bindPara.verifyCode == ''){
                $.toast('请输入验证码');
                return;
            }

            bindMobile(bindPara);
        }
    }
});

function checkMobileBeforeSendCode() {
    var checkReult;

    if (app.mobileInpVal == '') {
        $.toast('请输入手机号');
        checkReult = false;
    } else {
        if (!xq.isPhone(app.mobileInpVal)) {
            $.toast('手机号格式不正确');
            checkReult = false;
        } else {
            checkReult = true;

            var sendPara = {
                "phone": app.mobileInpVal,
                "timestamp": new Date().getTime(),
                "appId": xq.appId
            };

            var sign = xq.signCoputed(sendPara);
            sendPara.sign = sign;

            axios.post(sendApiUrl,sendPara).then(function(res){
                if(res.data.code == 200){
                    $.toast(res.data.message);
                }else{
                    $.toast(res.data.message);
                }
            }).catch(function(err){
                console.log(err)
            });
        }
    }

    return checkReult;
}

function bindMobile(param){
    var sign = xq.signCoputed(param);
    param.sign = sign;
    axios.defaults.headers.common['Authorization'] = "Bearer " + sessionStorage.getItem('apiToken');

    axios.post(bindMobileApiUrl,param).then(function(res){
        if(res.data.code == 200){
            $.toast('绑定成功');

            clearTimeout(timeout);
            var timeout = setTimeout(function(){
                location.href="order_1.html?orderId=" + xq.getUrlParam(orderId);
            },2000);
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}