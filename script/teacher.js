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