var getOrdersUrl = xq.xqAPI + 'order/my/list';

var app = new Vue({
    el:'#myApp',
    data:{

    },
    methods:{

    }
});

function getMyOrders(){
    var orderListPara = {
        'orderType':0, //0: 全部, 1: 拼班, 2: 一对一
        'orderBigStatus':0, // 订单大状态(0: 全部, 1: 待处理, 2: 进行中, 3: 已完成)
        'count':10,  //返回的数据行数
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
        }else{
            $.toast(res.data.message);
        }
    }).catch(function(err){
        console.log(err);
    });
}

getMyOrders();