var app = new Vue({
    el:'#myApp',
    data:{
        class_type:'teacher',
        person_num:'person_one',
        ifShowType:false,
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
        ]
    },
    methods:{
        //授课方式-老师上门 or 家长上门
        classType:function(type){
            //console.log(typeof(type));
            this.class_type = type == 0?'teacher':'parents';
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
        },
        //选择课程分类
        selectCourseType:function(){
            this.ifShowType = true;
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
            this.ifShowType = false;

            all.forEach(function(parent,i){
                parent.categrys.forEach(function(child,i){
                    //追加的属性，用来控制分类选中着色
                    child.selected = false;
                });
            });

            item.selected = true;
            this.selectedCourse = item.courseName; 
        }
    },
    computed:{
        newCourseType:function(){
            return this.courseType;
        },
        selectedCategrys:function(){
            return this.courseType[this.selectedCategryIndex].categrys;
        },
        selectedCourseTxt:function(){
            var txt = this.selectedCourse ==="" ? '请选择': this.selectedCourse;

            return txt;
        }
    },
    mounted:function(){
        //打开上次展开的分类
        var that = this;
        var selectedIndex = that.selectedCategryIndex
        that.courseType[selectedIndex].isActive = true;
    }
});

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

    var currTime = new Date().format("yyyy-MM-dd-hh-mm");

    //选择时间
    $("#datetime-picker").datetimePicker({
        value: currTime.split('-')
    });
});