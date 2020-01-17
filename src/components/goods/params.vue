<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--警告区域-->
    <el-card>
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="warning" show-icon :closable="false"></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader v-model="selectedKeys" :options="cateList" expand-trigger="hover"
                                            :props="cascaderProps" @change="parentCateChanged" clearable change-on-select></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">

          <el-button class="butt" :disabled="isBtnDisabled" @click="addDialogVisible =true"  type="primary" size="mini">添加参数</el-button>

          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)" >{{item}}</el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <!--输入按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete"  @click="removeParams(scope.row.attr_id)" >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">

          <el-button class="butt"  :disabled="isBtnDisabled" @click="addDialogVisible =true" type="primary" size="mini">添加属性</el-button>

            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)" >{{item}}</el-tag>
                  <!--输入文本框-->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <!--输入按钮-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)" >编辑</el-button>
                  <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)"  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数对话框-->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
    </el-dialog>

    <!--编辑参数对话框-->
    <el-dialog
      :title=" '修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editParams">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'params',
    data(){
      return{
        //下拉数据来源
        cateList: [],
        //指定级联对象的配置对象
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        //选中父级分类ID数组
        selectedKeys: [],
        activeName: 'many',
        //动态参数
        manyTableData: [],
        //静态参数
        onlyTableData: [],
        //控制添加对话框显示隐藏
        addDialogVisible : false,
        addForm: {
          attr_name: ''
        },
        addFormRules: {
          attr_name:[{ required: true,message: '请输入参数名称', trigger: 'blur' }]
        },
        editDialogVisible : false,
        editForm: {
          attr_name: ''
        },
        editFormRules: {
          attr_name:[{ required: true,message: '请输入参数名称', trigger: 'blur' }]
        }
      }
    },
    created (){
      //获取所有商品分类列表
      this.getCateList()
    },
    methods:{
      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if(res.meta.status !== 200) return this.$message.error('获取商品分类失败')
        this.cateList = res.data
        console.info('商品分类',res)
      },
      //切换分类
      parentCateChanged(){
        this.getParamsData()

      },
      //面板切换
      handleClick(tab, event) {
      this.getParamsData()

      },
      async getParamsData(){
        //只允许选择3级分类
        if(this.selectedKeys.length !== 3){
          this.selectedKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        //证明选择三级分类
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          {params:{sel:this.activeName}})
        if(res.meta.status !== 200) return this.$message.error('获取参数失败')


        res.data.forEach(item =>{
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          //控制文本框显示隐藏
          item.inputVisible = false
          //文本框中输入的值
          item.valueValue = ''
        })
        if(this.activeName === 'many'){
          this.manyTableData  = res.data
        }else {
          this.onlyTableData  = res.data
        }
      },
      //监听添加对话框的关闭事件
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      //添加表单提交
      addParams(){
        this.$refs.addFormRef.validate( async vaild =>{
          if(!vaild) return
          const { data : res } =  await this.$http.post(`categories/${this.cateId}/attributes`,{attr_name:this.addForm.attr_name,attr_sel:this.activeName})
          console.info('res',res)
          if(res.data !== 201)  this.$message.error('添加失败')
          this.$message.success('添加成功')
          this.addDialogVisible = false
          this.getParamsData()
        })
      },
      //监听添加对话框的关闭事件
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      editParams(){
        this.$refs.editFormRef.validate( async vaild =>{
          if(!vaild) return
          const { data : res } =  await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{attr_name:this.editForm.attr_name,attr_sel:this.activeName})
          console.info('res',res)
          if(res.meta.status !== 200)  this.$message.error('编辑失败')
          this.$message.success('修改成功')
          this.getParamsData()
          this.editDialogVisible = false
        })
      },
      //点击按钮展示对话框
      async showEditDialog(attr_id){
        console.info('attr_Id')
        const { data : res } =  await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
        if(res.meta.status !== 200)  this.$message.error('获取参数列表失败')
        this.editForm  = res.data
        console.info('this.res.data',res.data)
        this.editDialogVisible = true
      },
      //根绝ID删除对应参数项
      async removeParams(attr_id) {
       const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
       if(result !== 'confirm'){
         return this.$message.info('取消删除！！！')
       }
        const { data : res } =  await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if(res.meta.status !== 200)  this.$message.error('删除失败')
        this.$message.success('删除参数成功')
        this.getParamsData()
      },
      //文本框失去焦点
      async handleInputConfirm(row){
        console.log('OK ')
        if(row.inputValue.trim().length===0){
          row.inputValue =''
          row.inputVisible = false
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue =''
        row.inputVisible = false
        //如果没有return 证明输入内容，需要做后续处理
       this.saveAttrVals(row)


      },
      //将对attr_vals保存到数据库
     async saveAttrVals(row){
        const { data : res } =  await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name:row.attr_name,
          attr_sel:row.attr_sel,
          attr_vals:row.attr_vals.join(' ')
        })
        if(res.meta.status !== 200)  this.$message.error('修改失败！')
        this.$message.success('修改参数成功！')
      },
      //点击按钮展示输入框
      showInput(row){
        row.inputVisible = true
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        });
      },
      //删除下拉的数据
      handleClose(i,row){
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row);

      }
    },
    // https://www.cnblogs.com/gunelark/p/8492468.html
    computed: {
      isBtnDisabled(){
        if(this.selectedKeys.length !== 3){
          return true
        }
        return false
      },
      //当前选中三级分类Id
      cateId(){
        if(this.selectedKeys.length === 3){
          return this.selectedKeys[2]
        }
        return null
      },
      //计算标题
      titleText(){
        if(this.activeName === 'many'){
          return '动态参数'
        }else {
          return  '静态属性'
        }

      }
    }

  }
</script>

<style lang="less" scoped>
  .cat_opt{
    margin: 15px 0px  15px 0px;
    text-align: left;
  }
  .butt{
    margin: 0px 0px  15px 0px;
    float:left
  }
  .el-tag{
    margin: 10px;
  }
  .input-new-tag{
    width: 120px;
  }
</style>
