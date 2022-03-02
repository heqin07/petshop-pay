<!--购物车-->
<template>
  <div
    v-loading="settle.orderNo"
    element-loading-spinner="none"
    element-loading-background="rgba(255, 255, 255, 0.5)"
    class="desk-cart"
  >
    <el-row justify="space-between">
      <el-col
        :span="16"
        class="flex-col"
      >
        <el-button
          class="active-btn"
          @click="handleChooseCustomer"
        >
          {{ cart.memberPhone ? '切换客户' : '选择客户' }}
        </el-button>
        <span v-if="cart.memberPhone">
          {{ cart.memberPhone || encryptPhone }}
          {{ '\u00a0\u00a0\u00a0' + cart.memberName }}
        </span>
      </el-col>
      <el-col
        :span="8"
        style="text-align:right"
      >
        <!-- <el-button v-if="cart.goods.length">编辑整单</el-button> -->
        <!-- @click="handleEditOrder" -->
        <el-button @click="handleCancelOrder">整单取消</el-button>
      </el-col>
    </el-row>
    <el-row
      class="content"
      :style="{
        height: Number(cart.discountValue) || cart.express.phone ?
          'calc(100vh - 272px)' :'calc(100vh - 232px)'
      }"
    >
      <div
        v-if="noData"
        class="no-data"
      >
        <img
          src="../../assets/store/cart_nodata.png"
          alt=""
        >
        <span>扫码/点击右侧商品，加入购物车结账</span>
      </div>
      <div
        v-else
        style="margin-right:10px"
      >
        <el-row
          v-for="(i, index) in cart.goods"
          :key="index"
        >
          <good-card
            :data="i"
            operate
          />
        </el-row>
      </div>
    </el-row>
    <!--折扣/优惠悬浮按钮-->
    <div
      v-if="Number(cart.discountValue)"
      class="reduce"
    >
      <template v-if="cart.discountType === 1">
        <i
          class="el-icon-close"
          @click="hanldeCloseReduce"
        />
        {{ `整单折扣 ${cart.discountValue}折` }}
      </template>
      <template v-else>
        <i
          class="el-icon-close"
          @click="hanldeCloseReduce"
        />
        {{ `整单立减￥${cart.discountValue}` }}
      </template>
    </div>

    <el-row
      class="summary"
      justify="space-between"
    >
      <div>共 {{ cart.goods.length }} 项</div>
      <div>合计：<span>￥{{ getSummary }}</span></div>
      <div>已优惠：
        <span>￥{{ cart.discountType === 1 ? cart.reduceValue : cart.discountValue || '0.00' }}</span>
      </div>
      <div
        class="detail"
        @click="handleDetail"
      >
        <span>优惠明细<span class="alittle">></span></span>
      </div>

    </el-row>
    <el-row
      class="bottom"
      justify="space-between"
    >
      <!-- 
      <el-button
        class="bottom-btn"
        @click="handleGift"
      >赠品</el-button>
      <el-button
        class="bottom-btn"
        :disabled="!cart.goods.length"
        @click="handleReducePrice"
      >
        优惠
      </el-button> -->
      <div class="inline-flex">
        导购员：
        <el-select
          v-model="salesmanId"
          filterable
          placeholder="请选择"
          @change="onChangeSalesman"
          style="width:100px"
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.salespersonName"
            :value="item.id"
          />
        </el-select>
      </div>
      <!-- <div class="bdge-wrap">
        <span
          v-if="pendOrderCount"
          class="bdage"
        >{{ pendOrderCount }}</span>
        <el-button
          class="bottom-btn"
          :loading="pendOrderLoading"
          @click="handleFetchOrder"
        >挂/取单</el-button>
      </div> -->
      <el-button
        :loading="settleLoading"
        class="bottom-btn"
        :disabled="!cart.goods.length"
        @click="handlePaymentOrder"
      >收款<span>￥0.00</span></el-button>
      <el-button
        class="bottom-btn"
        @click="editVisible = true"
      >商品改价</el-button>
      <el-button
        class="bottom-btn"
        @click="staffVisible = true"
      >选择员工</el-button>
      <!-- <el-button
        v-preventReClick
        :loading="settleLoading"
        class="active-btn"
        :disabled="!cart.goods.length"
        @click="handlePaymentOrder"
      >
        结算
      </el-button> -->
    </el-row>
    <!-- 选择员工 -->
    <el-dialog
      v-model="staffVisible"
      title="选择员工"
      width="500px"
      center
    >
      <el-row justify="center">
        <el-radio-group v-model="radio1">
          <el-radio-button label="导购员"></el-radio-button>
          <el-radio-button label="操作人"></el-radio-button>
        </el-radio-group>
      </el-row>
      <el-row
        justify="center"
        class="search"
      >
        <el-input
          ref="keyboard"
          v-model="staffName"
          placeholder="请输入员工名称"
          maxlength="50"
          clearable
        >
          <!-- @input="handleSearch"
          @keyup="keyboardEvent"  :prefix-icon="Search" -->
        </el-input>
      </el-row>
      <el-row class="group-staff">
        <el-checkbox-group
          v-model="checkboxGroup1"
          size="large"
        >
          <el-checkbox-button
            v-for="city in cities"
            :key="city"
            :label="city"
          >
            {{ city }}
            <span style="margin-left:6px">{{ "111" }}</span>
          </el-checkbox-button>
        </el-checkbox-group>
      </el-row>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="staffVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="staffVisible = false"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!--优惠弹框-->
    <e-dialog
      :draggable="false"
      title="整单优惠"
      v-model="reduceVisible"
      :show-close="true"
      width="45%"
      :show-btn="false"
      class="reduce-dialog"
    >
      <template #content>
        <el-row class="tab">
          <el-radio-group
            v-model="reduceForm.discountType"
            @change="reduceForm.discountValue = ''"
          >
            <el-radio-button :label="1">整单折扣</el-radio-button>
            <el-radio-button :label="2">整单减价</el-radio-button>
          </el-radio-group>
        </el-row>
        <el-row style="text-align:center">
          <el-input
            :key="reduceForm.discountType"
            v-model="reduceForm.discountValue"
            class="input"
            :placeholder="reduceForm.discountType === 1 ? '可输入0.1-9.9' : '可输入0-50000.00'"
          />
          <!-- v-input-limit="reduceForm.discountType === 1 ?
              { min: 0.1, max: 9.9, precision: 1 } :
              { min: 0, max: 50000.00, precision: 2 }" -->
        </el-row>
        <el-row class="key-board">
          <KeyBoard
            v-model="reduceForm.discountValue"
            :precision="reduceForm.discountType === 1 ? 1 : 2"
            @submit="handleSubmitReduce"
          />
        </el-row>
      </template>
    </e-dialog>
    <!--快递打包费用弹框-->
    <e-dialog
      v-if="logisticsVisible"
      class="logistics-dialog"
      :draggable="false"
      title="快递/打包费"
      v-model="logisticsVisible"
      :show-close="true"
      :immediate-close="false"
      width="45%"
      @submit="handleSubmitLogistics"
    >
      <template #content>
        <div class="form">
          <el-form
            ref="logistics-form"
            :model="logisticsForm"
            :rules="logisticsRule"
            label-width="100px"
          >
            <el-col :span="12">
              <el-form-item
                label="快递公司"
                prop="expressCompanyId"
              >
                <el-select
                  v-model="logisticsForm.expressCompanyId"
                  filterable
                  clearable
                  placeholder="请选择"
                  style="width:100%"
                  @change="handleSelectExpressCompany"
                >
                  <el-option
                    v-for="item in expressCompanyList"
                    :key="item.id"
                    :label="item.logistics"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="快递单号"
                prop="expressNo"
              >
                <el-input
                  v-model="logisticsForm.expressNo"
                  maxlength="30"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="收件人"
                prop="receiver"
              >
                <el-input
                  v-model="logisticsForm.receiver"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="联系电话"
                prop="phone"
              >
                <el-input
                  v-model="logisticsForm.phone"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="收货地址"
                prop="address"
              >
                <el-input
                  v-model="logisticsForm.address"
                  maxlength="100"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="快递/打包费"
                prop="expressFee"
              >
                <div class="form-tips">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="快递税率默认为9%"
                    placement="right-start"
                  >
                    <i class="el-icon-info" />
                  </el-tooltip>
                  <el-input
                    v-model="logisticsForm.expressFee"
                    type="number"
                    placeholder="请输入"
                  />
                  <!-- v-input-limit="{ min: 0, max: 10000, precision: 2 }" -->
                </div>
              </el-form-item>
            </el-col>
          </el-form>
        </div>
      </template>
    </e-dialog>
    <!--编辑整单-->
    <!-- <e-dialog
      v-if="editVisible"
      title="商品改价"
      v-model="editVisible"
      :immediate-close="false"
      :show-close="true"
      width="60%"
      @submit="handleSubmitEdit"
    >
      <template #content>
        <div style="padding:20px">
          <e-table
            :data="editGoodsList"
            :header="tableHeader"
            :attr-data="tableAttr"
            :operates="operates"
            @inputChange="handleInputChange"
            @numberChange="handleNumberChange"
            @handle_command="handle_command"
          >
            <template #bulkPrice="scope">
              <div
                @mouseover="bulkMouseOver(scope.index)"
                @mouseleave="bulkMouseLeave(scope.index)"
              >
                <span
                  :ref="'isbuikElement' + scope.index"
                  class="displayInline"
                >*</span>
                <span
                  :ref="'buikElement' + scope.index"
                  class="displayNone"
                >{{ (scope.row.bulkPrice &lt; 0) ? '—' : scope.row.bulkPrice }}</span>
              </div>
            </template>
            <template #discount="scope">
              <el-input
                v-model="scope.row.discount"
                v-input-limit="{ min: 0, max: 10, precision: 1 }"
                @input="handleInputChange('discount', scope.index)"
              />
            </template>
            <template #discountPrice="scope">
              <el-input
                v-model="scope.row.discountPrice"
                v-input-limit="{ min: 0, max: scope.row.retailPrice, precision: 2 }"
                :style="scope.row.bulkValid === false ? {border: '1px solid red'} : {}"
                @input="handleInputChange('discountPrice', scope.index)"
              />
            </template>
            <template #chooseStorage="scope">
              <el-input-number
                v-model="scope.row.chooseStorage"
                v-input-limit="{min: 1, max: scope.row.availableStock, precision: 0}"
                :precision="0"
                controls-position="right"
                :min="1"
                :max="scope.row.availableStock"
                style="width:90%"
                @input="handleNumberChange(scope.index)"
              />
            </template>
          </e-table>
        </div>
      </template>
    </e-dialog> -->
    <el-dialog
      v-model="editVisible"
      title="商品改价"
      :immediate-close="false"
      width="600px"
      center
    >
      <div class="change-price">
        <div>
          <span class="left">消费项目</span>
          <span class="right">渴望Orijen原始猎食爱猫经典六种鱼全猫粮1kg</span>
        </div>
        <div>
          <el-row>
            <el-col :span="12">
              <span class="left">零售价(￥)</span>
              <span class="right">164.00</span>
            </el-col>
            <el-col :span="12">
              <span class="left">销售单位</span>
              <span class="right">件</span>
            </el-col>
          </el-row>
        </div>
        <div>
          <el-row>
            <el-col :span="24">
              <span class="left">改价金额</span>
              <span>
                <el-input
                  v-model="price"
                  class="mount"
                  placeholder="输入金额"
                >
                </el-input>
                <span class="left">改价范围：¥0.01 - ¥100169.00</span>
              </span>
            </el-col>
          </el-row>
        </div>
        <div>
          <el-row>
            <el-col :span="24">
              <span class="left">改价折扣</span>
              <span>
                <el-input
                  v-model="discount"
                  class="mount"
                  placeholder="输入折扣"
                >
                </el-input>
                <span class="left">折扣范围：1.0 - 59271.0%</span>
              </span>
            </el-col>
          </el-row>
        </div>
        <div>
          <span class="left">购买数量</span>
          <span class="right">1个</span>
        </div>
        <div>
          <span class="left">改后总价</span>
          <span class="red">￥132.00</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="editVisible = false"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import GoodCard from './components/GoodCard.vue'
import KeyBoard from './components/KeyBoard/index.vue'
import { mapGetters } from 'vuex'
import { api } from '../config'
// import { deepClone } from '../../utils/index'
export default {
  components: { GoodCard, KeyBoard },
  props: {
    goodsList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      price: '',
      discount: '',
      checkboxGroup1: ['Shanghai'],
      cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen'],
      staffName: '',
      radio1: '操作人',
      staffVisible: false,//选择员工弹出
      salesmanName: '',
      salesmanId: '',
      options: [],
      // note: '',
      noData: false,
      settleLoading: false, // 结算按钮添加loading
      pendOrderLoading: false, // 挂单按钮添加loading
      reduceVisible: false, // 优惠弹框
      reduceCount: '', // 优惠输入框数据
      reduceForm: {
        discountType: 1,
        discountValue: '1'
      },
      logisticsVisible: false, // 快递打包弹框
      logisticsForm: {
        expressCompany: '',
        expressCompanyId: '',
        expressCompanyCode: '',
        expressFee: '',
        expressNo: '',
        receiver: '',
        phone: '',
        address: ''
      },
      expressCompanyList: [],
      editVisible: false,
      editGoodsList: [], // 缓存一份数据用于弹框整单编辑
      tableHeader: [
        { label: '消费项目', prop: 'name', width: 160 },
        { label: '销售单位', prop: 'unit', width: 80 },
        // {
        //   label: '批发价(￥)', prop: 'bulkPrice', width: 100,
        //   formatter: (row) => {
        //     return row.bulkPrice < 0 ? '—' : row.bulkPrice
        //   }
        // },
        {
          label: '批发价(￥)', prop: 'bulkPrice', type: 'slot', width: 100
        },
        { label: '零售价(￥)', prop: 'retailPrice', width: 100 },
        { label: '折扣率', prop: 'discount', type: 'slot', width: 120 },
        { label: '折后价(￥)', prop: 'discountPrice', type: 'slot', width: 140 },
        { label: '购买数量', prop: 'chooseStorage', type: 'slot', width: 150 },
        {
          label: '小计(￥)', prop: 'summary', minWidth: 100,
          formatter: (scope) => {
            return Number(scope.summary).toFixed(2)
          }
        },
        { label: '操作', type: 'action', width: 100 }
      ],
      operates: [
        { label: '删除', type: 'delete' }
      ],
      tableAttr: {
        showTop: false
      },
      pendOrderCount: 0, // 挂单数量
      logisticsRule: {
        'expressCompanyId': [
          { required: true, message: '请输入快递公司' }
        ],
        'expressNo': [
          { required: true, message: '请输入快递单号', trigger: 'blur' }
        ],
        'receiver': [
          { required: true, message: '请输入收件人' }
        ],
        'phone': [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1(3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        'address': [
          { required: true, message: '请输入收货地址', trigger: 'blur' }
        ],
        'expressFee': [
          { required: true, message: '请输入快递/打包费' }
        ]
      },
      cart: {
        goods: [
          {
            businessType: 'NORMAL', //商品类型: NORMAL普通商品, STORE_CARD储值卡, TIME_CARD次卡  √
            businesses: [
              {
                businessType: '导购员',//	业务员类型：SALES_MAN:导购员，OPERATOR:操作员
                personId: '0989'
              }
            ],
            buyCount: 1, //购买数量  √
            buyRefId: 0,//	购买类型关联ID, 普通商品为0
            buyType: 'NORMAL',	  //购买类型: BUY_TYPE: NORMAL非赠品, GIFT:普通赠品, TIME_CARD:次卡
            discountPrice: 34.00,	//折扣价，未改价不传值，两位小数
            discountRate: 1,      //折扣率, 未改价为1
            isEdit: false,      //	是否已改过价  √
            productId: 4535634, //	商品ID或者储值卡次卡ID  √
            retailPrice: 34.00,  //	零售价，两位小数
            skuId: 0,     //	商品sku-id, 无规格商品不传值
            subtotalAmount: 34.00, //小计总金额, 未改价不传值
          }
        ],
        payments: [], // 支付列表
        total_price: '', // 实际支付金额
        discountValue: '', // 优惠价或折扣率
        discountType: '', // 优惠类型 整单折扣or整单减价
        reduceValue: '', // 已优惠价格
        express: '', // 物流信息
        note: '', // 备注
        salesmanId: '', // 业务员id
        salesmanName: '', // 业务员name
        customerId: '',
        customerCode: '',
        customerName: '',
        memberName: '', // 会员姓名
        memberPhone: '', // 会员电话
        settlementId: '',
        settlementCode: '',
        settlementName: ''
      },
      // goodsList: [{
      //   businessType: 'NORMAL',   //	业务类别：NORMAL: 直接收银台, FOSTER: 寄养 √
      //   configId: 2324, //	收银台配置ID √
      //   customerId: 123, //	客户ID
      //   refId: 123,  //	关联业务id
      //   coupons: [1223],  //	优惠券ID，目前仅支持单张优惠券
      //   details: [ //结算商品列表
      //     {
      //       businessType: 'NORMAL', //商品类型: NORMAL普通商品, STORE_CARD储值卡, TIME_CARD次卡  √
      //       businesses: [
      //         {
      //           businessType: '导购员',//	业务员类型：SALES_MAN:导购员，OPERATOR:操作员
      //           personId: '0989'
      //         }
      //       ],
      //       buyCount: 1, //购买数量  √
      //       buyRefId: 0,//	购买类型关联ID, 普通商品为0
      //       buyType: 'NORMAL',	  //购买类型: BUY_TYPE: NORMAL非赠品, GIFT:普通赠品, TIME_CARD:次卡
      //       discountPrice: 0.00,	//折扣价，未改价不传值，两位小数
      //       discountRate: 1,      //折扣率, 未改价为1
      //       isEdit: false,      //	是否已改过价  √
      //       productId: 4535634, //	商品ID或者储值卡次卡ID  √
      //       retailPrice: 34.00,  //	零售价，两位小数
      //       skuId: 0,     //	商品sku-id, 无规格商品不传值
      //       subtotalAmount: 34.00, //小计总金额, 未改价不传值
      //     }
      //   ],
      //   discountAmount: 0.00, //	整单折扣值/整单立减值
      //   discountType: '',  //	discount: 整单折扣; reduce: 整单立减, 不传值，表示未参与收银台优惠
      //   payments: [  //付款明细（组合支付）
      //     {
      //       change: 0.00, //	支付找零金额 ，两位小数
      //       details: [  //储值卡支付信息，当支付类型为【余额支付】时必传
      //         {
      //           customerId: '',  //	客户ID,当支付类型为【押金支付】时必传
      //           pay: '',  //	支付金额，两位小数  √
      //           storeCardId: '',  //	储值卡id   √
      //         }
      //       ],
      //       pay: 0.00, //	支付金额，两位小数   √
      //       payId: '',  //	支付类型ID  √
      //       payType: '', //	支付类型   √
      //     }
      //   ],
      //   isSmallChange: false, //	是否抹零   √
      //   offerAmount: 0.00,  //	优惠金额，所有优惠金额综合   √
      //   paymentAmount: 0.00, //	应收金额   √
      //   receiveAmount: 0.00,	 //收到金额，实际支付金额   √
      //   smallChangeAmount: 0.00, //	抹零金额
      //   totalAmount: 0.00, //	总价金额，订单商品的原价*数量  √
      //   remark: ''   //	商家备注
      // }],
      settle: {}
    }
  },
  computed: {
    // ...mapGetters(['cart', 'settle', 'userInfo']),
    ...mapGetters(['cart', 'settle']),
    getSummary() {
      // 合计 = 商品总价 - 优惠价 + 运费
      let { total_price, reduceValue } = this.cart
      const { express } = this.cart
      total_price = total_price ? +total_price : 0
      reduceValue = reduceValue ? +reduceValue : 0
      const expressPrice = express && express.expressFee
        ? +express.expressFee : 0
      return (total_price - reduceValue + expressPrice).toFixed(2)
    }
  },
  watch: {
    'cart.goods.length': {
      handler(val) {
        if (val) {
          this.noData = false
        } else {
          this.noData = true
        }
      },
      immediate: true
    },
    'cart.salesmanId': {
      handler(val) {
        if (!val) {
          this.salesmanId = ''
        }
      },
      immediate: true
    },
    // 'userInfo.user.orgId': {
    //   handler(val) {
    //     if (val) {
    //       this.getSalesmanNameList()
    //       this.salesmanId = (Number(this.cart.salesmanId) == 0 || isNaN(Number(this.cart.salesmanId))) ? '' : Number(this.cart.salesmanId)
    //     } else {
    //       // 获取用户信息
    //       // this.$http.get(this.$api.getUserInfo)
    //       //   .then((res) => {
    //       //     this.$store.commit('user/SET_USER_INFO', res.data || {})
    //       //   })
    //     }
    //   },
    //   immediate: true
    // },
    logisticsVisible(val) {
      if (!val) {
        Object.keys(this.logisticsForm).forEach(i => {
          this.logisticsForm[i] = ''
        })
      }
    },
    editVisible(val) {
      if (!val) {
        this.editGoodsList = []
      }
    }
  },
  created() {
    // this.getLogisticsList()
    // this.getPendOrderCount()
  },
  methods: {
    // 获取当前挂单数量
    getPendOrderCount() {
      this.$http.post(this.$api.getPendOrderCount).then((res) => {
        this.pendOrderCount = res.data || 0
      })
    },
    // 获取快递公司列表
    getLogisticsList() {
      this.$http.post(`${this.$api.getLogisticsList}?pageSize=1000&pageNo=1`, {
        logistics: '',
        status: 1
      }).then((res) => {
        this.expressCompanyList = res.data.rows || []
      })
    },
    // 选择快递公司
    handleSelectExpressCompany(val) {
      const obj = this.expressCompanyList.find(i => i.id === val)
      this.logisticsForm.expressCompany = obj.logistics
      this.logisticsForm.expressCompanyCode = obj.code
    },
    handleChooseCustomer() {
      this.$emit('openPage', 'customer')
      console.log()
    },
    // 整单取消
    handleCancelOrder() {
      this.$confirm('整单取消会清空商品、优惠等信息，是否整单取消？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.commit('cart/RESET_CART')
        this.salesmanId = ''
      }).catch(() => {
        return
      })
    },
    // handleEditOrder() {
    //   const goods = this.cart.goods.filter(i => i.gift !== true)
    //   goods.forEach(i => { i.summary = i.chooseStorage * i.discountPrice })
    //   this.editGoodsList = deepClone(goods) // 解决浅拷贝问题
    //   this.editVisible = true
    // },
    // 整单折扣率和折后价互相计算
    handleInputChange(prop, index) {
      if (prop === 'discount') {
        this.editGoodsList[index].discountPrice =
          Number(this.editGoodsList[index].retailPrice) *
          Number(this.editGoodsList[index].discount) / 10
        this.editGoodsList[index].discountPrice = this.editGoodsList[index].discountPrice.toFixed(2)
      } else if (prop === 'discountPrice') {
        this.editGoodsList[index].discount =
          Number(this.editGoodsList[index].discountPrice) /
          Number(this.editGoodsList[index].retailPrice) * 10
        this.editGoodsList[index].discount = this.editGoodsList[index].discount.toFixed(1)
      }
      this.editGoodsList[index].summary =
        this.editGoodsList[index].discountPrice *
        this.editGoodsList[index].chooseStorage
      this.editGoodsList[index].summary = this.editGoodsList[index].summary.toFixed(2)
    },
    handleNumberChange(index) {
      this.editGoodsList[index].summary =
        this.editGoodsList[index].discountPrice *
        this.editGoodsList[index].chooseStorage
      this.editGoodsList[index].summary = this.editGoodsList[index].summary.toFixed(2)
    },
    handle_command(row, type) {
      if (type === 'delete') {
        const idx = this.editGoodsList.findIndex(i => i.id === row.id)
        this.editGoodsList.splice(idx, 1)
      }
    },
    // 提交整单编辑
    handleSubmitEdit() {
      const discountLessBulk = this.editGoodsList.some(i =>
        !isNaN(+i.bulkPrice) && +i.discountPrice < +i.bulkPrice
      )
      this.editGoodsList.forEach(j => {
        if (+j.discountPrice < +j.bulkPrice) {
          this.$set(j, 'bulkValid', false)
        }
      })
      if (discountLessBulk) {
        return this.$confirm('当前折后价低于批发价，是否确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.editVisible = false
            this.$store.commit('cart/ALL_EDIT', this.editGoodsList)
            this.editGoodsList.forEach(j => {
              delete j.bulkValid
            })
          })
          .catch(() => { })
      }
      this.editVisible = false
      this.$store.commit('cart/ALL_EDIT', this.editGoodsList)
    },
    // 商品优惠
    handleReducePrice() {
      this.reduceVisible = true
    },
    // 提交商品优惠
    handleSubmitReduce() {
      if (this.reduceForm.discountType === 1 && (Number(this.reduceForm.discountValue) < 0.1 || Number(this.reduceForm.discountValue) > 9.9)) {
        this.$message({
          message: '整单折扣超出0.1-9.9范围',
          type: 'warning'
        })
      } else if (this.reduceForm.discountType === 2 && (Number(this.reduceForm.discountValue) < 0 || Number(this.reduceForm.discountValue) > 50000.00)) {
        this.$message({
          message: '整单减价超出0-50000.00范围',
          type: 'warning'
        })
      } else {
        this.reduceVisible = false
        this.$store.commit('cart/ADD_REDUCE', this.reduceForm)
      }
    },
    // 选择业务员
    onChangeSalesman() {
      let salesmanForm = {}
      this.salesmanName = this.options.filter((item) => item.id === this.salesmanId)[0].salespersonName
      salesmanForm = {
        salesmanId: this.salesmanId,
        salesmanName: this.salesmanName
      }
      this.$store.commit('cart/SET_SALES_MAN', salesmanForm)
    },
    // 取消商品优惠
    hanldeCloseReduce() {
      this.$store.commit('cart/CANCEL_REDUCE')
    },
    handleSubmitLogistics() {
      this.$refs['logistics-form'].validate((valid) => {
        if (valid) {
          if (this.cart.express && this.cart.express.expressFee) {
            this.$store.commit('cart/CANCEL_EXPRESS')
          }
          this.$store.commit('cart/ADD_EXPRESS', this.logisticsForm)
          this.logisticsVisible = false
        } else {
          return false
        }
      })
    },
    // 赠品
    handleGift() {
      this.$emit('openPage', 'gift')
    },
    handleFetchOrder() {
      // 挂单
      this.$emit('openPage', 'fetchOrder')
      // if (this.cart.goods && this.cart.goods.length) {
      //   this.pendOrderLoading = true
      //   this.$http.post(this.$api.pendOrder, this.getSubmitParams())
      //     .then(() => {
      //       this.$message({
      //         type: 'success',
      //         message: '挂单成功'
      //       })
      //       this.$store.commit('cart/RESET_CART')
      //       this.getPendOrderCount()
      //       this.$emit('fetchGoods')
      //     })
      //     .finally(() => {
      //       this.pendOrderLoading = false
      //       this.salesmanId = ''
      //     })
      //   // 取单
      // } else {
      //   this.$emit('openPage', 'fetchOrder')
      // }
    },
    getSubmitParams() {
      const {
        goods, businessType, configId, customerId, refId, coupons, discountAmount, discountType, isSmallChange, offerAmount,
        paymentAmount, receiveAmount, smallChangeAmount, totalAmount, remark
      } = this.cart
      const details = [],
        businesses = [{
          businessType: '',
          personId: ''
        }];//商品操作员列表
      goods.forEach(i => {
        details.push({
          businessType: i.businessType,
          businesses: businesses,
          chooseStorage: i.chooseStorage,
          buyRefId: i.buyRefId,
          buyType: i.buyType,
          discountPrice: i.discountPrice,
          discountRate: i.discount,
          isEdit: i.isEdit,
          productId: i.productId,
          retailPrice: i.retailPrice,
          skuId: i.skuId,
          subtotalAmount: i.subtotalAmount,
        })
      })
      const params = {
        businessType: businessType,
        configId: configId,
        customerId: customerId || null,
        refId: refId || null,
        coupons: coupons || null,
        details,
        discountAmount: discountAmount || null,
        discountType: discountType || null,

        isSmallChange: isSmallChange,
        offerAmount: offerAmount,
        paymentAmount: paymentAmount,
        receiveAmount: receiveAmount,
        smallChangeAmount: smallChangeAmount || null,
        totalAmount: totalAmount,
        remark: remark
      }
      return params
    },
    // 结算订单
    handlePaymentOrder() {
      // if (this.salesmanId === '' || this.salesmanId === undefined) {
      //   this.$message({
      //     message: '请选择业务员后再进行结算',
      //     type: 'warning'
      //   })
      // } else {
      this.settleLoading = true
      this.$http.post(api.settleOrder, this.getSubmitParams())
        .then((res) => {
          // 设置后台结算返回数据
          // this.$store.commit('cart/SET_SETTLE_DATA', res.data || {})
          this.$emit('openPage', 'payment')
        })
        .finally(() => {
          this.settleLoading = false
        })
      // }
    },
    // 获取业务员列表
    getSalesmanNameList() {
      // this.$http.get(`${this.$api.getSalesmanNameList}/${this.userInfo.user.orgId}`)
      //   .then((res) => {
      //     this.options = res.data || []
      //   })
    },
    bulkMouseOver(index) {
      this.$refs['buikElement' + index].style.display = 'inline'
      this.$refs['isbuikElement' + index].style.display = 'none'
    },
    bulkMouseLeave(index) {
      this.$refs['buikElement' + index].style.display = 'none'
      this.$refs['isbuikElement' + index].style.display = 'inline'
    },
    handleDetail() {
      this.$emit('openPage', 'discountDetail')
    }
  }
}
</script>

<style lang="less" scoped>
.desk-cart {
  width: 100%;
  padding: 20px;
  min-height: calc(100vh - 84px);
  background: #fff;
  .reduce {
    width: 160px;
    background: #ffd5c1;
    border: 1px solid #ff6f2a;
    color: #ff0c0c;
    font-size: 13px;
    padding: 8px;
    text-align: center;
    margin-bottom: 10px;
    position: relative;
    display: inline-block;
    margin-right: 20px;
    i {
      position: absolute;
      right: -10px;
      top: -10px;
      width: 20px;
      height: 20px;
      border-radius: 32px;
      background: #f77840;
      color: #fff;
      line-height: 20px;
      cursor: pointer;
    }
  }
  .summary {
    > div {
      margin-right: 18px;
    }
    font-size: 14px;
    span {
      color: #ff4040;
    }
    .inline-flex {
      display: flex;
      align-items: center;
      width: 300px;
      margin-top: -7px;
    }
    .detail {
      cursor: pointer;
      span {
        color: #888;
        margin-left: 12px;
      }

      .alittle {
        margin-left: 12px;
      }
    }
  }
  .flex {
    display: flex;
    justify-content: space-between;
  }
  .content {
    // width: 100%;
    margin: 20px 0;
    height: calc(100vh - 290px);
    overflow-y: scroll;
  }
  .bottom {
    margin-top: 20px;
    &-btn {
      height: 32px;
      min-width: 100px;
      margin-right: 10px;
    }
    .bdge-wrap {
      position: relative;
      .bdage {
        z-index: 999;
        position: absolute;
        right: 0px;
        top: -10px;
        display: block;
        width: 20px;
        height: 20px;
        border-radius: 32px;
        background: #f77840;
        color: #fff;
        text-align: center;
        line-height: 20px;
        font-size: 12px;
      }
    }
  }
  .flex-col {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 100px;
    img {
      width: 360px;
      height: 360px;
    }
    span {
      margin-top: -20px;
      text-align: center;
      color: #b3b3b3;
      font-size: 14px;
    }
  }
  .reduce-dialog {
    .tab {
      text-align: center;
      margin: 20px;
    }
    .input {
      width: 460px;
      margin: 0 auto;
    }
    .key-board {
      margin: 10px auto;
    }
  }
  .logistics-dialog {
    width: 500px;
    .form {
      width: 80%;
      margin: 40px auto 20px auto;
      .form-tips {
        display: flex;
        align-items: center;
        margin-left: -10px;
        i {
          margin-right: 10px;
        }
      }
    }
  }
  ::v-deep(.el-input--small .el-input__inner) {
    height: 32px;
    line-height: 32px;
  }
  ::v-deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    color: #fff;
    background-color: #ff6f2a;
    border-color: #ff6f2a;
    -webkit-box-shadow: -1px 0 0 0 #ff6f2a;
    box-shadow: -1px 0 0 0 #ff6f2a;
    padding: 10px 40px;
  }
  ::v-deep(.el-radio-button__inner) {
    // border: 1px solid #ff6f2a;
    // color: #ff6f2a;
    padding: 10px 40px;
    font-size: 14px;
  }
  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 6px;
    height: 50px;
    background: rgba(0, 0, 0, 0.2); //滚动条颜色
  }
  .displayNone {
    display: none;
  }
  .displayInline {
    display: inline;
  }

  // 选择员工弹出
  .search {
    padding: 20px 40px;
    width: 100%;
    height: 80px;
    // position: relative;
    .el-radio-group {
      line-height: 40px;
    }
    ::v-deep(.el-input__inner) {
      height: 40px;
      line-height: 40px;
      border-radius: 10px;
      background: #f8f8f8;
      border: 1px solid #f2f2f2;
    }
    ::v-deep(.el-input__icon) {
      line-height: 40px;
      font-size: 16px;
    }
  }
  .group-staff {
    .el-checkbox-button {
      margin-right: 20px;
      margin-bottom: 20px;
    }
    ::v-deep(.el-checkbox-button__inner) {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }
    ::v-deep(.is-checked .el-checkbox-button__inner) {
      border: 1px solid #409eff;
      border-radius: 4px;
    }
  }

  // 商品改价
  .change-price {
    padding: 0px 20px;
    font-size: 14px;
    > div {
      margin-bottom: 30px;
    }
    .left {
      color: #888;
      margin-right: 20px;
    }
    .right {
      color: #333;
    }
    .red {
      color: red;
    }
    .mount {
      width: 160px;
      margin: 0 10px;
      ::v-deep(.el-input-group__append) {
        // background-color: #fff;
        // padding-left: 0;
        padding: 0 11px;
      }
      // ::v-deep(.el-input__inner) {
      // border-right: none;
      // }
    }
  }
}
</style>
