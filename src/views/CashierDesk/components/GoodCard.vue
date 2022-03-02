<template>
  <div
    :class="{ 'desk-goods-card': true, 'active': data.buyCount && !operate }"
    :style="{ height: operate ? '130px' : data.gift ? '100px' : '80px' }"
    @click="handleChooseGoods"
  >
    <el-row
      class="title"
      justify="space-between"
    >
      <span>
        <span
          v-if="data.gift && operate"
          class="gift"
        >赠品</span>
        {{ data.name }}
      </span>
      <el-icon
        v-if="operate"
        class="el-icon-delete"
        @click.stop="handleDelete"
      >
        <delete></delete>
      </el-icon>
    </el-row>
    <template v-if="operate">
      <el-row
        class="info"
        justify="space-between"
        style="margin-top:10px;"
      >
        <span style="width:50px;">{{ data.spec }}/{{ data.unit }}</span>
        <span style="width:80px;">库存：{{ data.availableStock }}</span>
      </el-row>
      <el-row
        class="info"
        justify="space-between"
        style="margin-top:10px;margin-bottom:10px"
      >
        <span class="price">￥{{ data.retailPrice || '--' }}</span>
        <el-input-number
          :key="data.id"
          v-model="data.buyCount"
          :precision="0"
          :min="1"
          :max="getMaxStorage"
          size="small"
          @input="handleEditCart"
          @click.stop
        />
        <!-- v-input-limit="{min: 1, max: getMaxStorage, precision: 0}" -->
        <span class="price operate-price">
          ￥{{ data.gift ? '0.00' : (data.discountPrice * data.buyCount).toFixed(2) }}
        </span>
      </el-row>
      <el-row class="staff">
        <span>导购员：</span>
        <span class="space">xxx</span>
        <span class="space">|</span>
        <span>操作人：</span>
        <span class="space">xxx</span>
        <el-icon
          class="close"
          style="font-size: 16px"
        >
          <circle-plus />
        </el-icon>
      </el-row>
    </template>
    <template v-else>
      <el-row
        class="info"
        justify="space-between"
      >
        <span>{{ data.spec }}/{{ data.unit }}</span>
        <span>库存：{{ data.availableStock }}</span>
        <span
          v-if="!data.gift"
          class="price"
          style="width:100px;"
        >
          ￥{{ data.retailPrice || '--' }}
        </span>
        <div
          v-else
          class="gift-price"
        >
          <span class="price">￥{{ data.retailPrice || '--' }}</span>
          <span class="price">￥{{ '0.00' }}</span>
        </div>
      </el-row>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    data: {
      type: Object,
      default: () => { }
    },
    operate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cart: {
        goods: []
      }
    }
  },
  computed: {
    // 校验库存，赠品和普通商品库存互斥
    getMaxStorage() {
      let storage = 0
      if (this.data.gift) {
        this.cart.goods.forEach(i => {
          if (i.id === this.data.id && !i.gift) {
            storage = i.buyCount
          }
        })
      } else {
        this.cart.goods.forEach(i => {
          if (i.id === this.data.id && i.gift) {
            storage = i.buyCount
          }
        })
      }
      return this.data.availableStock - storage
    },
    // 计算同件商品既是赠品又是普通商品的库存之和
    getTotalStorage() {
      let storage = 0
      this.cart.goods.forEach(i => {
        if (i.id === this.data.id) {
          storage += i.buyCount
        }
      })
      return storage
    },
    ...mapGetters(['cart'])
  },
  methods: {
    handleChooseGoods() {
      if (this.operate) return
      if (!this.data.retailPrice) {
        return this.$message(
          { type: 'error', message: '商品价格为空，请维护价格后售卖' }
        )
      }
      if (this.getTotalStorage >= this.data.availableStock) {
        return this.$message(
          { type: 'error', message: '商品库存不足，无法再增加' }
        )
      }
      this.$store.commit('cart/ADD_GOOD', this.data)
    },
    handleDelete() {
      this.$store.commit('cart/DELETE_GOOD', this.data)
    },
    handleEditCart() {
      this.$store.commit('cart/EDIT_GOOD')
    }
  }
}
</script>

<style lang="less" scoped>
.desk-goods-card {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  float: right;
  background: #fff;
  border: 1px solid #c1c1c1;
  cursor: pointer;
  .title {
    font-size: 14px;
    span {
      max-width: 80%;
      color: rgba(0, 0, 0, 0.85);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .gift {
      padding: 10px;
      background: #f77840;
      color: #fff;
    }
  }
  .info {
    margin-top: 20px;
    span {
      font-size: 12px;
      color: #797979;
      width: 130px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .price {
      font-size: 14px;
      color: rgba(114, 112, 112, 0.85);
      width: 130px;
    }
    .operate-price {
      width: 130px;
      text-align: right;
    }
    .gift-price {
      display: flex;
      flex-direction: column;
      width: 65px;
      span {
        &:first-child {
          text-decoration: line-through;
        }
        &:last-child {
          color: #272727;
        }
      }
    }
  }
  .staff {
    color: #888;
    font-size: 12px;
    .space {
      margin-right: 12px;
    }
  }
}
.active {
  background: #f1dbd2;
  border: 1px solid #f77840;
}
</style>
