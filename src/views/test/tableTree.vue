<template>
	<div>
	
	<el-button @click="addClick" type="primary" size="mini">增加</el-button>
	 <el-table
      :data="MenusList"
      style="width: 100%;margin-bottom: 20px;"
	  row-key="id"
      stripe
	  :tree-props="{ hasChildren: 'hasChildren', children: 'children' }">
	    
	      <el-table-column label="菜单名称">
	      	<template slot-scope="scope">
	      		{{scope.row.label}}
	      	</template>
	      </el-table-column>
	      <el-table-column label="菜单类型" align="center" :filters="[{ text: '目录', value: 0 }, { text: '菜单', value:1 }, { text: '按钮', value:2}]" :filter-method="filterTag" filter-placement="bottom-end">
			  <template slot-scope="scope">
				  <el-tag :type="scope.row.type|getBindStatus" close-transition>{{scope.row.type|getBindText}}</el-tag>
			  </template>
		  </el-table-column>
	      <el-table-column label="图标" prop="icon" align="center">
			<template slot-scope="scope">
				<i :class="scope.row.icon"></i>
			</template>
		  </el-table-column>
	      <el-table-column label="路由名称" prop="name" align="center"></el-table-column>
		  <el-table-column label="路由地址" prop="path" align="center"></el-table-column>
		  <el-table-column label="权限字段" prop="code" align="center"></el-table-column>
		  <el-table-column label="组件路径" prop="url" align="center"></el-table-column>
	      <el-table-column label="操作" width="300" align="center">
	        <template slot-scope="scope">
	          <el-button
	            @click="editClick(scope.row)"
	            type="primary"
	            size="mini"
	          >编辑</el-button>
	          <el-button
	            @click="deleteClick(scope.row)"
	            type="danger"
	            size="small"
	          >删除</el-button>
	        </template>
	      </el-table-column>
    </el-table>
    <el-dialog
	  :title="dialogType==='edit'?'编辑路由':'新增路由'"
	  :visible.sync="dialogVisible"
	  width="50%"
	  :before-close="handleClose">
	  <el-form ref="formDg" :model="Menu" label-width="80px">    
		<el-form-item label="菜单类型"  style="width:100%;">
			<template>
				<el-radio-group v-model="radio" @change="radioChange">
					<el-radio  label="0">目录</el-radio>
					<el-radio  label="1">菜单</el-radio>
					<el-radio  label="2">按钮</el-radio>
				</el-radio-group>
			</template>
		</el-form-item>
		<el-form-item label="上级菜单">
			<el-input @click.native="getTop" v-model="Menu.parentName" placeholder="上级菜单" clearable />
		</el-form-item>
	  	<el-form-item label="菜单名称">
	  		<el-input v-model="Menu.label" placeholder="菜单名称" clearable />
	  	</el-form-item>
		<template v-if="radio==0">
                <el-form-item label="菜单图标">
					<el-input v-model="Menu.icon" placeholder="菜单图标" clearable />
				</el-form-item>
				<el-form-item label="路由名称">
					<el-input v-model="Menu.name" placeholder="路由名称" clearable />
				</el-form-item>
		</template>
		<template v-if="radio==1">
                <el-form-item label="菜单图标">
					<el-input v-model="Menu.icon" placeholder="菜单图标" clearable />
				</el-form-item>
				<el-form-item label="路由名称">
					<el-input v-model="Menu.name" placeholder="路由名称" clearable />
				</el-form-item>
				<el-form-item label="路由地址">
					<el-input v-model="Menu.path" placeholder="路由地址" clearable />
				</el-form-item>
				<el-form-item label="组件路径">
					<el-input v-model="Menu.url" placeholder="组件路径" clearable />
				</el-form-item>
		</template>
	  	<el-form-item label="权限字段">
	  		<el-input v-model="Menu.code"  clearable />
	  	</el-form-item>
	  	<el-form-item label="权限备注">	
	  		<el-input v-model="Menu.remark"  clearable />
	  	</el-form-item>
		<el-form-item label="权限序号">
			<el-input-number v-model="num" step-strictly></el-input-number>
		</el-form-item>
	  </el-form>
	  <span slot="footer" class="dialog-footer">
	    <el-button @click="dialogVisible = false">取 消</el-button>
	    <el-button type="primary" @click="saveMenu">确 定</el-button>
	  </span>
	</el-dialog>
	<sys-dialog
	 :title="parentTree.title"
	 :visible="parentTree.visible"
	 :width="parentTree.width"
	 :height="parentTree.height"
	 @onClose="parentOnClose"
	 @onConfirm="parentOnComfirm"
	>
    <div slot="content">
		<el-tree  
		class="tree-line"
		ref="parenTree"
		:data="treeList" 
		node-key="id"
		:props="defaultProps" 
		@node-click="handleNodeClick"
		:expand-on-click-node="false"
		highlight-current
		default-expand-all
		>
		<div class="custom-tree-node" slot-scope="{node,data}">
          <span v-if="data.children.length===0"><i class="el-icon-folder"></i></span>
		  <span v-else @click="openBtn(data)">
              <i v-if="data.open" class="el-icon-folder-add"></i>
			  <i v-else class="el-icon-folder-remove"></i>
		  </span>
		  <span>{{node.label}}</span>
        </div>
		</el-tree>
	</div>
	</sys-dialog>
  </div>
</template>

<script>
	import{getMenuInfo,deletMenu,getParent,saveMenu} from '@/api/menu'
    import SysDialog from '../system/sysDialog.vue'
	export default {
	  data() {
	    return {
		  parentTree:{
			 title:'',
			 width:300,
			 height:400,
			 visible:false
		  },
		  treeList:[],
		  defaultProps: {
			children: 'children',
			label: 'label'
		  },
	      dialogVisible: false,
	      Menu:[],
	      dialogType:'add',
		  MenusList:[],
		  radio:'0',
		  num:0
	    };
	  },
	  created() {
	  	this.getMenuInfo();
	  },
	  methods: {
		  	async getMenuInfo(){
				  const res =await getMenuInfo();
				  if(res.data.length>=1){
                           const list=res.data;
							function toTree(list){
								let temp = [];
								let tree = [];
								for(let i in list){// 将数据变换成{key: obj}格式，方便下面处理数据
									temp[list[i].id] = list[i];
								}
								for(let i in temp){
									if(temp[i].parentId!=0) {// 判断父级是否存在
										if(!temp[temp[i].parentId].children) {// 如果有没有父级children字段，就创建一个children字段
											temp[temp[i].parentId].children = new Array();
										}
										temp[temp[i].parentId].children[temp[i].id] = temp[i];// 在父级里插入子项
									} else {
										tree[temp[i].id] =  temp[i];// 如果没有父级直接插入到最外层
									}
								}
								return tree;
							}
							this.MenusList=toTree(list);
							console.log(this.MenusList);
				  }
		  		
			  },
			filterTag:function(value, row) { 
				if(row!=""&&row!=undefined&&row!=null){
				  return row.type === value;
				}
			},
		  	editClick:function(row){
				this.Menu=row;
				if(row.type==0){
					this.radio='0';
				}else if(row.type==1){
					this.radio='1';
				}else{
					this.radio='2';
				}
		  		this.dialogVisible=true;
		  		this.dialogType='edit';
		  	},
		    handleClose(done) {
		        this.$confirm('确认关闭？')
		          .then(_ => {          	
		            done();
		          })
		          .catch(_ => {});
		    },
		    addClick:function(){
				this.dialogVisible=true; 
				this.Menu={};
				this.radio='0';
		    	this.dialogType='add';
		    },
		    deleteClick:function(row){
		    	this.$confirm('确定删除?', 'Warning', {
			        confirmButtonText: '确定',
			        cancelButtonText: '取消',
			        type: 'warning'
			    }).then(()=>{
						  let id=row.id;
						  deletMenu(id).then(res=>{
							  if(res.code==200){
								  this.$message({
									  message:"删除成功",
									  type:"success"
								  });
								  this.getMenuInfo();
							  }else{
								  this.$message('删除失败');
							  }
						  })
	            }).catch(err => {
	                    console.error(err)
	            })
			},
			radioChange:function(val){
				let that = this 
                that.radio=val;
			},
			async getTop(){
				this.parentTree.visible=true;
				this.parentTree.title="选择上级"
				let res=await getParent();
				this.treeList=res.data;
			},
			 handleNodeClick(data) {
				this.Menu.parentName=data.label;
			},
			parentOnClose(){
				this.parentTree.visible=false;
			},
			parentOnComfirm(){
				this.parentTree.visible=false;
			},
			openBtn(data){
				data.open=!data.open;
				this.$refs.parenTree.store.nodesMap[data.id].expanded =!data.open;
			},
			async saveMenu(){
				let res=await saveMenu(this.Menu);
				console.log(res);
			}
	  },
	filters: {
            //tag类型
            getBindStatus(bindStatus) {
                const bindColor = {
                    0: 'danger',
					1: 'success',
					2:'danger'
 
                };
                return bindColor[bindStatus]
            },
            //颜色名称
            getBindText(bindStatus) {
                const bindText= {
                    0: '目录',
					1: '菜单',
					2: '按钮',
 
                };
                return bindText[bindStatus]
            }
 
 
	},
	components:{
		SysDialog
	}
 }
</script>

<style lang="scss">
.el-dialog__header{background-color: #1890ff;border-color: #1890ff;}
.el-dialog__header span,.el-dialog__header i{color:#ffffff!important;}
.el-form{display:flex;justify-content: space-between;align-items: center;flex-wrap: wrap;}
.el-form-item{width:48%;}
.tree-line .el-tree-node__expand-icon{display: none!important;}
.tree-line{
  .el-tree-node {
    position: relative;
    padding-left: 16px; // 缩进量
  }
  .el-tree-node__children {
    padding-left: 16px; // 缩进量
  }

  // 竖线
  .el-tree-node::before {
    content: "";
    height: 100%;
    width: 1px;
    position: absolute;
    left: -3px;
    top: -26px;
    border-width: 1px;
    border-left: 1px dashed #d9d9d9;
  }
  // 当前层最后一个节点的竖线高度固定
  .el-tree-node:last-child::before {
    height: 38px; // 可以自己调节到合适数值
  }

  // 横线
  .el-tree-node::after {
    content: "";
    width: 24px;
    height: 20px;
    position: absolute;
    left: -3px;
    top: 12px;
    border-width: 1px;
    border-top: 1px dashed #d9d9d9;
  }

  // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
  & > .el-tree-node::after {
    border-top: none;
  }
  & > .el-tree-node::before {
    border-left: none;
  }
	
  // 展开关闭的icon
  .el-tree-node__expand-icon{
    font-size: 16px;
    // 叶子节点（无子节点）
    &.is-leaf{
      color: transparent;
      // display: none; // 也可以去掉
    }
  }
}
</style>