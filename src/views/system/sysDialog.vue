<template>
    <el-dialog
    top="1vh"
    :title="title"
    :visible="visible"
    :width="width+'px'"
    :before-close="onClose"
    >
       <div class="container" :style="{height:height+'px'}">
           <slot name="content"></slot>
       </div>
       <span slot="footer" class="dialog-footer">
           <el-button type="danger" @click="onClose()">取消</el-button>
           <el-button type="primary" @click="onConfirm()">确定</el-button>
       </span>
     </el-dialog>
</template>
<script>
export default {
    props:['title','visible','width','height'],
    data(){
        return{

        }
    },
    methods: {
        onClose(){
            this.$emit("onClose")
        },
        onConfirm(){
            this.$emit("onConfirm")
        }
    }
}
</script>