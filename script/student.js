﻿var saveInfoApiUrl = xq.xqAPI + 'parents/account/save';

var app = new Vue({
    el:'#myApp',
    data:{
        student_sex:'boy'
    },
    methods:{
        studentSex:function(gender){
            this.student_sex = gender == 0?'boy':'girl';
        },
        saveInfo:function(){

        }
    }
});