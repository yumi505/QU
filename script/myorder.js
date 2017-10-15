var getOrdersUrl = xq.xqAPI + 'order/my/list';

var app = new Vue({
    el:'#myApp',
    data:{
        orderList:[]
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
            getMyOrders(orderType);
        }
    }
});

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
    axios.defaults.headers.common['Authorization'] = "Bearer " + sessionStorage.getItem('accessToken');

    axios.get(getOrdersUrl,{params:orderListPara}).then(function(res){
        if(res.data.code == 200){
            console.log(res.data.data);
            app.orderList = res.data.data;
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

getMyOrders(1);