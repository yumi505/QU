var app = new Vue({
    el:'#myApp',
    data:{
        class_type:'teacher',
        person_num:'person_one'
    },
    methods:{
        classType:function(type){
            //console.log(typeof(type));
            this.class_type = type == 0?'teacher':'parents';
        },
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
        }
    }
});

(function($){
    $.extend({
        ZCountdown: function(options) {
            var defaults = {
                className: 'ZCountdown', //设置需要执行元素的className
                endTime: '2016/12/21 00:00:00', //设置倒计时的目标时间
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
})(Zepto);

$(function(){
    $.ZCountdown({
        className: '.ZCountdown',
        endTime: '2016/11/11 00:00:00'
    });
});