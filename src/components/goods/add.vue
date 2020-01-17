<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--警告区域-->
    <el-card>
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>
      <el-steps :space="3100" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'"  v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name" ><el-input v-model="addForm.goods_name"></el-input></el-form-item>
            <el-form-item label="商品数量" prop="goods_price"><el-input v-model="addForm.goods_price"></el-input></el-form-item>
            <el-form-item label="商品重量" prop="goods_weight"><el-input type="number" v-model="addForm.goods_weight"></el-input></el-form-item>
            <el-form-item label="商品数量" prop="goods_number"><el-input type="number" v-model="addForm.goods_number"></el-input></el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader
                  expand-trigger="hover"
                  v-model="addForm.goods_cat"
                  :options="cateList"
                  :props="cateProps"
                  @change="handleChange">
                </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="cb"  v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--action表示图片上传路径-->
            <el-upload :headers="headersObj"
              :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :on-success="handleSuccess">
              <el-button size="small" type="primary" class="upAdd">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">

            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览-->
    <el-dialog title="图片预览" :visible.sync="priviewVisible" width="50%">
      <img :src="previewPath" class="previewImg" alt="">
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'


  export default {
    name: 'add',
    data(){
      return{
        activeIndex: '0',
        addForm:{
          goods_name:'',
          goods_price: 0,
          goods_number: 0,
          goods_weight:0,
          goods_cat:[],
          pics: [],
          //商品详情描述
          goods_introduce: '',
          attrs:[]
        },
        addFormRules:{
          goods_name:[{required:true,message:'请输入商品名称',trigger:'blur'}],
          goods_price:[{required:true,message:'请输入商品价格',trigger:'blur'}],
          goods_weight:[{required:true,message:'请输入商品重量',trigger:'blur'}],
          goods_number:[{required:true,message:'请输入商品重量',trigger:'blur'}],
          goods_cat:[{required:true,message:'请选择商品分类',trigger:'blur'}]
        },
        cateList: [],
        cateProps:{
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        manyTableData: [],
        //静态属性列表数据
        onlyTableData: [],
        uploadUrl:'http://renoblog.xyz/api/private/v1/upload',
        //图片上传组件对象
        headersObj:{
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        priviewVisible: false
      }
    },
    created(){
      this.getCateList()
    },
    methods:{
      //获取所有商品分类数据
     async getCateList(){
       const { data : res } = await this.$http.get('categories')
       if(res.meta.status !== 200) this.$message.error('获取商品列表失败')
       this.cateList = res.data
       console.info('this.cateList',this.cateList)
      },
      //级联选择
      handleChange(){
        console.info('this.addForm.goods_cat',this.addForm.goods_cat)
        if(this.addForm.goods_cat.length !==3){
          this.addForm.goods_cat = []
        }
      },
      beforeTabLeave(active,oldActive){
        if(oldActive ===  '0' && this.addForm.goods_cat.length !== 3){
          this.$message.info('请先选择商品分类')
          return false
        }
      },
     async tabClicked(){
        if(this.activeIndex === '1'){
          const { data : res } = await this.$http.get(`categories/${this.cateId}/attributes`,{ params:{sel:'many'}})
          if(res.meta.status !== 200) this.$message.error('获取动态参数列表失败')
          res.data.forEach(item=>{
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
            console.log(item.attr_vals);
          })
          this.manyTableData = res.data
        }else if(this.activeIndex === '2'){
          const { data : res } = await this.$http.get(`categories/${this.cateId}/attributes`,{ params:{sel:'only'}})
          if(res.meta.status !== 200) this.$message.error('获取静态属性列表失败')
          console.info('res.data',res.data)
          this.onlyTableData = res.data
        }

      },
      handlePreview(file){
       console.log(file)
        this.previewPath = file.url
        this.priviewVisible = true
      },
      //移除图片操作
      handleRemove(file){
        console.log(file)
        const filePath = file.response.data.tmp_path
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        this.addForm.pics.splice(i,1)
      },
      //监听图片上传成功的事件
      handleSuccess(response){
       console.info('response',response)
       const picInfo = {pic:response.data.tmp_path}
       this.addForm.pics.push(picInfo)
      },
       add(){
       this.$refs.addFormRef.validate(async valid => {
         if(!valid){
           return this.$message.error('请填写必要的表单项')
         }
         //执行添加
         //lodash 深拷贝  cloneDeep(obj)
         const form = _.cloneDeep(this.addForm)
         form.goods_cat = form.goods_cat.join(',')
         //处理动态参数和静态属性
         this.manyTableData.forEach(item => {
           const newInfo = {
             attr_id: item.attr_id,
             attr_value: item.attr_vals.join(' ')
           }
           this.addForm.attrs.push(newInfo)
         })
         this.onlyTableData.forEach(item => {
           const newInfo = {
             attr_id: item.attr_id,
             attr_value: item.attr_vals
           }
           this.addForm.attrs.push(newInfo)
         })
         form.attrs = this.addForm.attrs

         const { data : res } = await this.$http.post('goods',form)
         if(res.meta.status !== 201) this.$message.error('添加商品失败！')
         this.$message.success('商品添加成功')
         this.$router.push('/goods')

       })
      }
    },
    computed:{
      cateId(){
        if(this.addForm.goods_cat.length === 3){
          return this.addForm.goods_cat[2]
        } else {
          return null
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox{
    margin: 0 5px 0 0 !important;
  }
  .el-form-item{
    text-align: left !important;
   }
  .previewImg{
    width: 100%
  }
  .btnAdd{
    margin-top: 15px;
    float: left;
  }
  .upAdd{
    float: left;
  }

</style>
