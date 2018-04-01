var redirect_uri = encodeURIComponent(location.href);
var tqDay = 2; //要求的提前预约天数
var wxAuthorUrl = xq.xqAPI + 'token/wx/create';
var tokenApiUrl = xq.xqAPI + 'token/create';
var hobbyApiUrl = xq.xqAPI + 'hobby/all/list';
var publishOrderUrl = xq.xqAPI + 'parents/order/oto/publish';

$(function(){
    Date.prototype.format = function(fmt) {
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };

        if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)){
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    };

    var currTime = new Date();
    //预约时间距离当前时间至少有1.5天之后
    var dateTime = new Date(currTime*1 + tqDay*24*60*60*1000).format("yyyy-MM-dd-hh-mm");

    //选择时间
    $("#datetime-picker").datetimePicker({
        value: dateTime.split('-'),
        inputReadOnly:false
    });

    $.init();
});


var app = new Vue({
    el:'#myApp',
    data:{
        class_type:'teacher',
        person_num:'person_one',
        selectedCategryIndex:0,
        selectedCourse:'',
        courseType:[
            {
             className:'舞蹈',
             categrys:[{
                courseID:1,
                courseName:'拉丁舞'
             },
             {
                courseID:1,
                courseName:'国标'
             },{
                courseID:1,
                courseName:'肚皮舞'
             }]
         },
         {
            className:'音乐',
             categrys:[{
                courseID:1,
                courseName:'钢琴'
             },
             {
                courseID:1,
                courseName:'小提琴'
             },{
                courseID:1,
                courseName:'古筝'
             }]
         },
         {
            className:'棋类',
             categrys:[{
                courseID:1,
                courseName:'五子棋'
             },
             {
                courseID:1,
                courseName:'中国象棋'
             },{
                courseID:1,
                courseName:'围棋'
             }]
         }
        ],
        apiToken:'',//接口授权 apiToken
        hobbyId:'',
        classesTime:'',
        classAddress:'',
        classesType: 1,
        studentCount: 1,
        remark:'',
        wxCode:'',
        wxOpenId:'',
        wxAccessToken:'',
        dateButtonEnabel:true,
        dateButtonTxt:"一键预约"
    },
    methods:{
        //授课方式-老师上门 or 家长上门
        classType:function(type){
            this.class_type = type == 1?'teacher':'parents';
            this.classesType = type;
        },
        //选择上课人数
        selectPerson:function(num){
            switch(num){
                case 1:
                    this.person_num = 'person_one';
                break;
                case 2:
                    this.person_num = 'person_two';
                break;
                case 3:
                    this.person_num = 'person_three';
                break;
            }
            this.studentCount = num;
        },
        //课程分类切换
        changeType:function(i,all){
            this.selectedCategryIndex = i;

            all.forEach(function(v,i){
                //追加的属性，用来控制分类选中着色
                v.isActive = false;
            });
            all[i].isActive = true;
        },
        selectType:function(item,all){
            all.forEach(function(parent,i){
                parent.childs.forEach(function(child,i){
                    //追加的属性，用来控制分类选中着色
                    child.selected = false;
                });
            });

            item.selected = true;
            this.selectedCourse = item.hobbyName;
            this.hobbyId = item.hobbyId;
        },
        submitOrder:function(){
            var publishOrderParam = {
                "hobbyId": this.hobbyId,
                "classesTime": '',
                "classesType": this.classesType,
                "address": this.classAddress,
                "lngX": 0,
                "latY": 0,
                "studentCount": this.studentCount,
                "remark": this.remark,
                "timestamp": new Date().getTime(),
                "appId": xq.appId
            };

            publishOrderParam.classesTime = $('#datetime-picker').val();

            if(publishOrderParam.hobbyId == ''){
                $.toast('请选择兴趣名称');
                return;
            }

            if(publishOrderParam.classesTime == ''){
                $.toast('请选择上课时间');
                return;
            }else{
               var nowTime = new Date()*1;
               var inpTime = new Date(publishOrderParam.classesTime)*1;
               var tqTime = tqDay*24*60*60*1000;
               var subTime = inpTime - nowTime;
               if(subTime < tqTime){
                    $.toast('预约时间至少提前2天');
                    return;
               }
            }

            if(publishOrderParam.classesType == 1){
                if(publishOrderParam.address == ''){
                    $.toast('请输入上课地点');
                    return;
                }
            }
            
            //上课要求改为非必填
            /*if(publishOrderParam.remark == ''){
                $.toast('请输入上课要求');
                return;
            }*/
            
            if(!this.dateButtonEnabel){
                return;
            }else{
                this.dateButtonEnabel = false;
                this.dateButtonTxt = "提交中...";
            }

            publishOrder(publishOrderParam);
        }
    },
    computed:{
        newCourseType:function(){
            return this.courseType;
        },
        selectedCategrys:function(){
            return this.courseType[this.selectedCategryIndex].childs;
        },
        selectedCourseTxt:function(){
            var txt = this.selectedCourse ==="" ? '请选择': this.selectedCourse;
            return txt;
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

            /*sessionStorage.setItem('wxOpenId',res.data.data[0].openId);
            sessionStorage.setItem('wxAccessToken',res.data.data[0].accessToken);
            sessionStorage.setItem('expiresIn',res.data.data[0].expiresIn);
            sessionStorage.setItem('sessionTimeStamp', new Date()*1);*/
            
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
            getHobby();
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function getHobby(){
    axios.defaults.headers.common['Authorization'] = "Bearer " + app.apiToken;
    //axios.defaults.headers.get['Content-Type'] = 'application/json';

    var hobbyParam = {
        "timestamp": new Date().getTime(),
        "appId": xq.appId
    };

    var sign = xq.signCoputed(hobbyParam);
    hobbyParam.sign = sign;

    axios.get(hobbyApiUrl,{params:hobbyParam}).then(function(res){
        if(res.data.code == 200){
            app.courseType = res.data.data;
            //默认展开第一个分类
            var that = app;
            var selectedIndex = that.selectedCategryIndex;
            that.courseType[selectedIndex].isActive = true;
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function publishOrder(param){
    var sign = xq.signCoputed(param);
    param.sign = sign;
    axios.defaults.headers.common['Authorization'] = "Bearer " + app.apiToken;

    axios.post(publishOrderUrl,param).then(function(res){
        if(res.data.code == 200){
            $.toast('预约成功');
            setTimeout(function(){
                //location.href="order_1.html?orderId=" + res.data.data[0].orderId;
                //预约成功后，跳转绑定手机
                location.href="bindmobile.html.html";
            },2000);
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
        getHobby();
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

