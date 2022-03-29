<template>
	<div>
		<button @click="app.say()">provide&inject</button>
		<button @click="add">增加</button>
		<keep-alive>
			<h1>here</h1>
			<component v-bind:is="my-pop" v-show="true"></component>
		</keep-alive>
		<table>
			<tr>
				<th>姓名</th>
				<th>技能</th>
				<th>操作</th>
			</tr>
			<tr v-for="(item,index) in dataList" :key="index">
                 <td>{{item.name}}</td>
				 <td>{{item.skill.toString()}}</td>
				 <td><button  @click="update(item,index)">编辑</button><button  @click="delet(index)">删除</button></td></tr>
		</table>
		<my-pop v-show="isShow" :data="myData" @submit-update="save" @close="close" ref="myPop">
			<template slot-scope="scope">
				<ul>
				   <li v-for="(item,index) in scope.dataTest" :key="index">{{item}}</li>
				</ul>
			</template>
		</my-pop>
		<el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
		<el-table
			ref="multipleTable"
			:data="tableData"
			 tooltip-effect="dark"
			style="width: 100%"
			@selection-change="handleSelectionChange">
			<el-table-column
			type="selection"
			width="55">
			</el-table-column>
			<el-table-column
			label="日期"
			width="120">
			<template slot-scope="scope">{{ scope.row.date }}</template>
			</el-table-column>
			<el-table-column
			prop="name"
			label="姓名"
			width="120">
			</el-table-column>
			<el-table-column
			prop="address"
			label="地址"
			show-overflow-tooltip>
			</el-table-column>
		</el-table>
		<div style="margin-top: 20px">
			<el-button @click="toggleSelection([tableData[1], tableData[2]])">切换第二、第三行的选中状态</el-button>
			<el-button @click="toggleSelection()">取消选择</el-button>
		</div>
	</div>
</template>

<script>
import myPop from './myPop';
export default {
	inject:['app'],
	data(){
		return{
			tableData: [{
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-08',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-06',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-07',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }],
        multipleSelection: [],
		   dataList:[
			   {
				   id:1,
				   name:"张三丰",
				   skill:["打坐","吃饭"]
			   },
			   {
				   id:2,
				   name:"欧阳克",
				   skill:["蛤蟆功","毒蛇"]
			   }
		   ],
		   myIndex:-1,
		   isShow:false,
		   myData:[],
		   attrs:["myPop"],
			data: [{
				label: '一级 1',
				children: [{
					label: '二级 1-1',
					children: [{
					label: '三级 1-1-1'
					}]
				}]
				}, {
				label: '一级 2',
				children: [{
					label: '二级 2-1',
					children: [{
					label: '三级 2-1-1'
					}]
				}, {
					label: '二级 2-2',
					children: [{
					label: '三级 2-2-1'
					}]
				}]
				}, {
				label: '一级 3',
				children: [{
					label: '二级 3-1',
					children: [{
					label: '三级 3-1-1'
					}]
				}, {
					label: '二级 3-2',
					children: [{
					label: '三级 3-2-1'
					}]
				}]
			}],
			defaultProps: {
				children: 'children',
				label: 'label'
			}
		}
	},
	mounted(){
	  console.log(this.$children[0].dataTest);
	  console.log(this.$refs.myPop.dataTest);
	},
	methods:{
		toggleSelection(rows) {
			if (rows) {
			rows.forEach(row => {
				this.$refs.multipleTable.toggleRowSelection(row);
			});
			} else {
			this.$refs.multipleTable.clearSelection();
			}
      },
      handleSelectionChange(val) {
		  console.log(111);
		this.multipleSelection = val;
      },
		add(){
			this.isShow=true;
			this.myIndex=-1;
			this.myData=[];
			console.log(this.$root.message);
		},
		update(item,index){
			  this.myIndex=index;
			  this.myData={...item};
			  this.isShow=true;
		},
		delet(index){
            this.dataList.splice(index,1);
		},
		save(newVal){
			if(this.myIndex==-1){
				this.dataList.unshift(newVal);
			}else{
				this.dataList.splice(this.myIndex,1,newVal);
			}
			this.close();
		},
		close(){
			this.isShow=false;
			this.mydata=[];
		},
		handleNodeClick(data) {
			console.log(data);
		}
	},
	components:{
	  "my-pop":myPop
	}
}
</script>

<style>
</style>