<!--商品列表-->
<template>
  <div class="desk-goods">
    <div
      v-if="isGift"
      class="header"
    >
      <span>赠品</span>
      <el-icon
        @click="handleClose"
        class="close"
      >
        <close-bold />
      </el-icon>
    </div>
    <el-row class="search">
      <div>
        <el-radio-group v-model="radio1">
          <el-radio-button label="商品"></el-radio-button>
          <el-radio-button label="服务"></el-radio-button>
          <el-radio-button label="活体"></el-radio-button>
        </el-radio-group>
      </div>
      <div style="width: 60%">
        <el-input
          ref="keyboard"
          v-model="goodsName"
          :prefix-icon="Search"
          placeholder="名称或条形码"
          maxlength="50"
          clearable
          @input="handleSearch"
          @keyup="keyboardEvent"
        >
        </el-input>

        <!-- <el-icon class="icon-search">
        <search />
      </el-icon> -->
      </div>

    </el-row>
    <el-row v-loading="loading">
      <div
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="busy"
        :infinite-scroll-immediate="false"
        :infinite-scroll-delay="200"
        :style="{ height: isGift ? 'calc(100vh - 230px - 8px)' : 'calc(100vh - 168px - 8px)'}"
        class="content"
      >
        <div class="good-dropdown">
          <el-button type="text">全部商品</el-button>
          <el-dropdown>
            <span class="el-dropdown-link">
              食品
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Action 1</el-dropdown-item>
                <el-dropdown-item>Action 2</el-dropdown-item>
                <el-dropdown-item>Action 3</el-dropdown-item>
                <el-dropdown-item>Action 5</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown>
            <span class="el-dropdown-link">
              用品
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Action 1</el-dropdown-item>
                <el-dropdown-item>Action 2</el-dropdown-item>
                <el-dropdown-item>Action 3</el-dropdown-item>
                <el-dropdown-item>Action 5</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div
          v-if="noData"
          class="no-data"
        >
          <img
            src="../../assets/store/goods_nodata.png"
            alt=""
          >
          <span>没有找到相关的商品</span>
        </div>
        <el-row
          v-else
          :gutter="20"
        >
          <el-col
            v-for="i in goodsList"
            :key="i.productId"
            :span="12"
            style="position:relative"
          >
            <span
              v-if="i.buyCount"
              class="bdage"
            >
              {{ i.buyCount > 99 ? '99+' : i.buyCount }}
            </span>
            <good-card
              ref="good-card"
              :data="i"
            />
          </el-col>
        </el-row>
      </div>
    </el-row>
    <el-row
      class="bottom"
      justify="end"
    >
      <el-button
        class="bottom-btn"
        @click="returnVisible = true"
      >退押金</el-button>
      <el-button
        class="bottom-btn"
        @click="handleGift"
      >赠品</el-button>
      <el-button class="bottom-btn">抹零</el-button>
      <el-button
        class="bottom-btn"
        @click="handleDiscount"
      >
        <!-- :disabled="!cart.goods.length" -->
        优惠
      </el-button>
      <!-- <el-button class="bottom-btn">备注</el-button> -->
      <el-button
        class="bottom-btn"
        @click="handleSpecs"
      >规格</el-button>
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
    <!-- 退押金 -->
    <el-dialog
      v-model="returnVisible"
      title="退款途径"
      :immediate-close="false"
      width="550px"
      center
    >
      <div>
        <p>收款详情：现金 ¥200.00、POS ¥73.00、支付宝 ¥737.00</p>
        <div style="margin-bottom: 20px;">
          退款金额：
          <el-input
            v-model="returnAmount"
            placeholder="Please input"
            clearable
            style="width:140px;"
          />
          <span style="margin-left: 10px;">元</span>

        </div>
        <el-button type="primary">原路退回</el-button>
        <el-button type="primary">退现金</el-button>
        <el-button @click="returnVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import GoodCard from './components/GoodCard.vue'
import { mapGetters } from 'vuex'
import { ElInfiniteScroll } from 'element-plus'
export default {
  directives: {
    'infinite-scroll': ElInfiniteScroll
  },
  components: {
    GoodCard
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
    // isGift: {
    //   type: Boolean,
    //   default: false
    // }
  },
  data() {
    return {
      returnAmount: '',
      returnVisible: false,
      radio1: '商品',
      isGift: false,
      goodsName: '',
      flagQRcode: false,
      arr: [],
      noData: false,
      params: {
        pageNo: 1,
        pageSize: 20,
        nameOrNo: ''
      },
      goodsList: [
        // {
        // businessType: 'NORMAL',   //	业务类别：NORMAL: 直接收银台, FOSTER: 寄养 √
        // configId: 2324, //	收银台配置ID √
        // customerId: 123, //	客户ID
        // refId: 123,  //	关联业务id
        // coupons: [1223],  //	优惠券ID，目前仅支持单张优惠券
        // details: [ //结算商品列表
        //   {
        //     businessType: 'NORMAL', //商品类型: NORMAL普通商品, STORE_CARD储值卡, TIME_CARD次卡  √
        //     businesses: [
        //       {
        //         businessType: '导购员',//	业务员类型：SALES_MAN:导购员，OPERATOR:操作员
        //         personId: '0989'
        //       }
        //     ],
        //     buyCount: 1, //购买数量  √
        //     buyRefId: 0,//	购买类型关联ID, 普通商品为0
        //     buyType: 'NORMAL',	  //购买类型: BUY_TYPE: NORMAL非赠品, GIFT:普通赠品, TIME_CARD:次卡
        //     discountPrice: 0.00,	//折扣价，未改价不传值，两位小数
        //     discountRate: 1,      //折扣率, 未改价为1
        //     isEdit: false,      //	是否已改过价  √
        //     productId: 4535634, //	商品ID或者储值卡次卡ID  √
        //     retailPrice: 34.00,  //	零售价，两位小数
        //     skuId: 0,     //	商品sku-id, 无规格商品不传值
        //     subtotalAmount: 34.00, //小计总金额, 未改价不传值
        //   }
        // ],
        // discountAmount: 0.00, //	整单折扣值/整单立减值
        // discountType: '',  //	discount: 整单折扣; reduce: 整单立减, 不传值，表示未参与收银台优惠
        // payments: [  //付款明细（组合支付）
        //   {
        //     change: 0.00, //	支付找零金额 ，两位小数
        //     details: [  //储值卡支付信息，当支付类型为【余额支付】时必传
        //       {
        //         customerId: '',  //	客户ID,当支付类型为【押金支付】时必传
        //         pay: '',  //	支付金额，两位小数  √
        //         storeCardId: '',  //	储值卡id   √
        //       }
        //     ],
        //     pay: 0.00, //	支付金额，两位小数   √
        //     payId: '',  //	支付类型ID  √
        //     payType: '', //	支付类型   √
        //   }
        // ],
        // isSmallChange: false, //	是否抹零   √
        // offerAmount: 0.00,  //	优惠金额，所有优惠金额综合   √
        // paymentAmount: 0.00, //	应收金额   √
        // receiveAmount: 0.00,	 //收到金额，实际支付金额   √
        // smallChangeAmount: 0.00, //	抹零金额
        // totalAmount: 0.00, //	总价金额，订单商品的原价*数量  √
        // remark: ''   //	商家备注
        // }
      ],
      busy: false,
      loading: false,
      cart: {
        goods: [],
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
    }
  },
  computed: {
    ...mapGetters(['cart'])
  },
  watch: {
    'cart.goods': {
      handler() {
        this.matchCartGoods()
      },
      deep: true
    },
    'goodsList.length': {
      handler(val) {
        if (val) {
          this.noData = false
        } else {
          this.noData = true
        }
      }
    },
    isGift() {
      this.goodsName = ''
      // this.handleSearch('')
    }
  },
  created() {
    // this.handleSearch('')
  },
  methods: {
    loadMore() {
      this.busy = true
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.params.pageNo += 1
        this.getList(true)
      }, 200)
    },
    // 判断 扫码枪还是手输入
    keyboardEvent(target) {
      const timeNow = target.timeStamp
      let iscontu = true
      this.arr.push(timeNow)
      let i
      for (i in this.arr) {
        if (Math.ceil(this.arr[this.arr.length - 1]) - Math.ceil(this.arr[this.arr.length - 2]) < 30) {
          iscontu = true
        } else {
          iscontu = false
        }
        if (i > 0 && this.arr.length == parseInt(i) + 1 && iscontu == true) {
          this.flagQRcode = true
        } else {
          this.flagQRcode = false
        }
      }
    },
    handleSearch(val) {
      this.params.pageNo = 1
      this.params.nameOrNo = val
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.getList()
      }, 200)
    },
    getList(flag) {
      const { pageNo, pageSize, nameOrNo } = this.params
      this.loading = true
      this.$http.get(this.$api.getGoodsList,
        { query: nameOrNo, pageNo, pageSize }
      ).then((res) => {
        if (flag) {
          this.goodsList = this.goodsList.concat(res.data.rows)
          // 如果是flag true，则拼接数组。
          if (res.data.rows.length === 0) {
            this.busy = true
          } else {
            this.busy = false
          }
        } else {
          this.goodsList = res.data.rows
          if (this.goodsList.length === 1 && this.flagQRcode === true) {
            this.$nextTick(() => {
              this.$refs['good-card'][0].handleChooseGoods()// 调用加入购物车
              setTimeout(() => {
                this.$refs['keyboard'].focus() // 搜索框获取焦点
                this.goodsName = ''
                this.handleSearch('')
              }, 10)
            })
          }
          this.busy = false
        }
        this.matchCartGoods()
      }).finally(() => {
        this.loading = false
      })
    },
    // 商品列表勾选数量同步购物车列表
    matchCartGoods() {
      this.goodsList.forEach(i => {
        if (this.isGift) {
          i.gift = true
        }
        if (i.buyCount) i.buyCount = 0
        for (const j of this.cart.goods) {
          // 区分赠品和普通商品(同一件商品，只是前端打上了gift标签)
          if (this.isGift) {
            if (i.id == j.id && j.gift) {
              this.$set(i, 'buyCount', j.buyCount)
            }
          } else {
            if (i.id == j.id && !j.gift) {
              this.$set(i, 'buyCount', j.buyCount)
            }
          }
        }
      })
    },
    handleClose() {
      this.isGift = false
      this.$emit('update:isGift', false)
      this.goodsList = []
      this.handleSearch('')
    },
    // 赠品
    handleGift() {
      this.$emit('openPage', 'gift')
      this.isGift = true
    },
    // 规格
    handleSpecs() {
      this.$emit('openPage', 'specs')
    },
    // 优惠
    handleDiscount() {
      this.$emit('openPage', 'discount')
    }
  }
}
</script>

<style lang="less" scoped>
.desk-goods {
  min-height: calc(100vh - 50px);
  background: #fff;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #e9e9e9;
    span {
      width: 100%;
      text-align: center;
    }
    .close {
      font-size: 24px;
      padding: 10px;
      font-weight: 600;
      color: #ff6f2a;
      cursor: pointer;
    }
  }
  .search {
    padding: 20px 40px;
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: space-between;
    // position: relative;
    .el-radio-group {
      line-height: 40px;
    }
    // .icon-search {
    //   position: absolute;
    //   top: 28px;
    //   left: 50px;
    //   color: #606266;
    // }
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
  .content {
    padding: 20px;
    width: 100%;
    height: calc(100vh - 168px);
    background: #f0f2f5;
    overflow-y: scroll;
    overflow-x: hidden;
    .good-dropdown {
      .el-dropdown {
        height: 32px;
        line-height: 32px;
        margin-left: 20px;
      }
      .example-showcase .el-dropdown-link {
        cursor: pointer;
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
      }
    }

    .bdage {
      position: absolute;
      right: 0px;
      top: -10px;
      display: block;
      width: 25px;
      height: 25px;
      border-radius: 32px;
      background: #f77840;
      color: #fff;
      text-align: center;
      line-height: 25px;
      font-size: 12px;
    }
  }
  .bottom {
    margin-top: 20px;
    padding-bottom: 20px;
    background-color: #fff;
    border-bottom: 2px solid #f0f2f5;
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
  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 200px;
    img {
      width: 150px;
      height: 150px;
    }
    span {
      margin-top: 20px;
      text-align: center;
      color: #b3b3b3;
      font-size: 14px;
    }
  }

  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 6px;
    height: 50px;
    background: rgba(114, 112, 112, 0.8); //滚动条颜色
  }
}
</style>
