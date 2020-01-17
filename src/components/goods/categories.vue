<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row :gutter="20">
        <el-col :span="2">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!--表格区域-->
    <tree-table :data="cateList" class="treeTable"
    :columns="columns" :selection-type="false"
                :expand-type="false" show-index index-text="#"
                border :show-row-hover="false">
      <template slot="isOk" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
        <i class="el-icon-error" v-else style="color: red"></i>
      </template>
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag size="mini" v-if="scope.row.cat_level === 1" type="success">二级</el-tag>
        <el-tag size="mini" v-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
      </template>
      <template slot="opt" slot-scope="scope">
        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
      </template>
    </tree-table>
    <!--分页区域-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="total"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <el-dialog title="添加分类" :visible.sync="addCatDialogVisible" width="50%" @close="closeCateDialog">
        <!--    -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级名称:">
          <el-cascader v-model="selectedKeys" :options="parentCateList" expand-trigger="hover"
                       :props="cascaderProps" @change="parentCateChanged" clearable change-on-select></el-cascader>
        </el-form-item>

      </el-form>

      <el-button @click="addCatDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: 'categories',
    data() {
      return {
        queryInfo: {
          type: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示数据条数
          pagesize: 5
        },
        //商品分类数据
        cateList:[],
        total: 0,
        //table指定列名称
        columns:[
          {label:'分类名称', prop:'cat_name'},
          {label:'是否有效',  type: 'template',template:'isOk'},
          {label:'排序',  type: 'template',template:'order'},
          {label:'操作',  type: 'template',template:'opt'},
        ],
        addCatDialogVisible: false,
        //添加分类表单对象
        addCateForm:{
          cat_name: '',
          cat_pid: 0,
          cat_level: 0
        },
        addCateFormRules:{
          cat_name:[
            {required:true, message:'请输入分类名称',trigger:'blur'}
          ]
        },
        //父级分类列表
        parentCateList: [],
        //指定级联对象的配置对象
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        //选中父级分类ID数组
        selectedKeys: []
      }
    },
    created (){
      this.getCateList()
    },
    methods: {
      async getCateList(){
        const { data: res } = await this.$http.get('categories',{ params: this.queryInfo })
        if(res.meta.status !== 200)return  this.$message.error('获取商品分类失败')
        this.cateList = res.data.result
        this.total = res.data.total
        console.info('商品分类',res)
      },
      handleSizeChange(newSize){
        console.info('newSize',newSize)
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      handleCurrentChange(newPage){
        console.info('newPage',newPage)
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      showAddCateDialog(){
        this.getParentCateList()
        this.addCatDialogVisible = true
      },
      //获取父级分类数据列表
      async getParentCateList() {
        const { data: res } = await this.$http.get('categories',{params: {type: 2}})
        if(res.meta.status !== 200)return  this.$message.error('获取父级分类失败')
        console.info('res',res.data)
        this.parentCateList =res.data
      },
      parentCateChanged(value) {
        console.log(value);
        if(this.selectedKeys.length >0){
          //当前分类的父Id
          this.addCateForm.cat_pid =  this.selectedKeys[this.selectedKeys.length-1]
          //当前分类等级
          this.addCateForm.cat_level = this.selectedKeys.length
        }else {
          this.addCateForm.cat_pid =  0
          //当前分类等级
          this.addCateForm.cat_level = 0
        }
      },
     async addCate(){
        console.info('this.addCateForm',this.addCateForm)
        this.$refs.addCateFormRef.validate(async vaild => {
          if (!vaild) return
          const { data : res } =  await this.$http.post('/categories',this.addCateForm)
          if(res.meta.status !== 201) this.$message.error('分类添加失败')
          this.$message.s('分类添加成功')
          this.getCateList()
          this.addCatDialogVisible = false
        })
      },
      closeCateDialog(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys =[]
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 25px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
