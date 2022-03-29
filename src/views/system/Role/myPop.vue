<template>
    <div class="pop">
        <ul>
           <li><span>姓名：</span><input type="text" v-model="infos.name"></li>
           <li><span>技能：</span><textarea type="text" v-model="skill"></textarea></li>
        </ul>
        <button @click="save">保存</button><button @click="close">取消</button>
        <slot :dataTest="dataTest"></slot>
    </div>
</template>
<script>
export default {
    props:['data'],
    data(){
        return{
            infos:this.data,
            dataTest: ['zhangsan','lisi','wanwu','zhaoliu','tianqi','xiaoba']
        }
    },
    mounted(){
        console.log(this.$parent.myIndex)
    },
    computed:{
       skill:{
         get(){
              return this.infos.skill?this.infos.skill.join('\n'):"";
         },
         set(val){
             let sk=val.split("\n");
             this.$set(this.infos, "skill",sk);
         }
       }
    },
    methods:{
        save(){
            this.$emit('submit-update',this.infos);
        },
        close(){
            this.$emit('close');
        }
    },
    watch:{
        data(newVal,oldVal){
            this.infos=newVal;
        }
    }
}
</script>
<style scoped>
*{margin:0;padding:0;}
ul li{list-style:none;}
.pop{position:absolute;top:200px;left:35%;z-index:999;}
</style>