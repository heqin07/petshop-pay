// 计算优惠价
function getReduceValue(cart) {
    let reduce = ''
    const {
        discountType,
        discountValue,
        total_price
    } = cart
    if (discountType === 1) {
        reduce = total_price * (1 - discountValue / 10).toFixed(2)
    } else {
        reduce = (discountValue > total_price) ? +total_price : +discountValue
    }
    // console.log('reduce', reduce)
    return +(+reduce).toFixed(2)
}

// 计算商品总价(商品单价 * 数量)
function getTotalPrice(cart) {
    let total = ''
    const {
        goods
    } = cart
    total = goods.reduce((pre, cur) => {
        return (pre + (cur.discountPrice || 0) * cur.chooseStorage)
    }, 0)
    return +(+total).toFixed(2)
}

const state = {
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
    settle: {} // 购物车结算成功，接口返回数据
}

const mutations = {
    // 添加商品进购物车
    ADD_GOOD: (state, good) => {
        let isNewGood = true
        if (good.gift) {
            state.cart.goods.forEach(item => {
                if (item.id == good.id && item.gift) {
                    item.chooseStorage += 1
                    isNewGood = false
                }
            })
        } else {
            state.cart.goods.forEach(item => {
                if (!item.gift) {
                    item.chooseStorage += 1
                    isNewGood = false
                }
            })
        }
        if (isNewGood) {
            const obj = Object.assign({}, good)
            // Vue.set(obj, 'chooseStorage', 1) // vue2 写法
            obj['chooseStorage'] = 1 // 默认设置购买数量1
            obj['discount'] = 10 // 默认设置折扣率10
            good.gift ?
                obj['discountPrice'] = '0.00' :
                obj['discountPrice'] = Number(obj.retailPrice).toFixed(2) // 默认设置折后价为零售价
            obj['summary'] = Number(obj.retailPrice * 1).toFixed(2) // 默认设置小计
            state.cart.goods.unshift(obj)
        }
        state.cart.total_price = getTotalPrice(state.cart)
        state.cart.reduceValue = getReduceValue(state.cart)
    },
    // 整单编辑功能
    ALL_EDIT: (state, list) => {
        const idList = []
        list.forEach(i => idList.push(i.id))
        state.cart.goods = state.cart.goods.filter(i => {
            return idList.includes(i.id) || i.gift
        })
        state.cart.goods.forEach((i, idx) => {
            for (const j of list) {
                if (i.id == j.id && !i.gift) {
                    state.cart.goods.splice(idx, 1, j)
                }
            }
        })
        state.cart.total_price = getTotalPrice(state.cart)
        state.cart.reduceValue = getReduceValue(state.cart)
    },
    // 编辑购物车
    EDIT_GOOD: (state) => {
        // 计算总价
        state.cart.total_price = getTotalPrice(state.cart)
        // 计算已优惠的价格
        state.cart.reduceValue = getReduceValue(state.cart)
    },
    // 删除商品
    DELETE_GOOD: (state, good) => {
        const idx = state.cart.goods.findIndex(i => i.id === good.id)
        state.cart.goods.splice(idx, 1)
        state.cart.total_price = getTotalPrice(state.cart)
        // 计算已优惠的价格
        state.cart.reduceValue = getReduceValue(state.cart)
        // console.log('delete cart goods', state.cart.goods)
    },
    // 取单操作...设置购物车数据
    SET_CART_DATA: (state, obj) => {
        const {
            skus,
            payments,
            express,
            discountValue,
            salesmanId,
            salesmanName,
            discountType,
            remark,
            customerId,
            customerCode,
            customerName,
            memberName,
            memberPhone,
            settlementId,
            settlementCode,
            settlementName
        } = obj
        state.cart.goods = skus && skus.length && skus.map(i => {
            return {
                chooseStorage: i.buyCount,
                discount: i.discountRate,
                discountPrice: i.discountPrice,
                summary: i.paymentPrice,
                gift: i.gift,
                retailPrice: i.retailPrice, // 零售价和库存暂时获取不到，先写死
                id: i.skuId,
                name: i.skuName,
                availableStock: i.stock,
                skuNo: i.skuNo,
                skuId: i.skuId,
                spec: i.skuSpecValue,
                specId: i.skuSpecId,
                unit: i.skuUnit,
                unitId: i.skuUnitId
            }
        }) || []
        state.cart.discountType = discountType
        state.cart.discountValue = discountValue
        state.cart.salesmanId = salesmanId
        state.cart.salesmanName = salesmanName
        state.cart.express = express || ''
        state.cart.note = remark
        state.cart.payments = payments || []
        state.cart.customerId = customerId
        state.cart.customerCode = customerCode
        state.cart.customerName = customerName
        state.cart.memberName = memberName
        state.cart.memberPhone = memberPhone
        state.cart.settlementId = settlementId
        state.cart.settlementCode = settlementCode
        state.cart.settlementName = settlementName
        state.cart.total_price = getTotalPrice(state.cart)
        state.cart.reduceValue = getReduceValue(state.cart)
    },
    // 切换会员
    SWITCH_CUSTOMER: (state, obj) => {
        const {
            id,
            code,
            name,
            defaultContactPhone,
            defaultContactName,
            settlementCustomerId,
            settlementCustomerCode,
            settlementCustomerName,
            province,
            city,
            district,
            contactAddress
        } = obj
        state.cart = Object.assign({}, state.cart, {
            customerId: id,
            customerCode: code,
            customerName: name,
            memberName: defaultContactName,
            memberPhone: defaultContactPhone,
            settlementId: settlementCustomerId,
            settlementCode: settlementCustomerCode,
            settlementName: settlementCustomerName,
            address: `${province === city ? province : '' + city + district + contactAddress}`
        })
    },
    // 添加快递/打包信息
    ADD_EXPRESS: (state, express) => {
        const obj = Object.assign({}, express)
        state.cart.express = obj
        // state.cart.total_price += +obj.expressFee
        // state.cart.total_price = (+state.cart.total_price).toFixed(2)
    },
    // 取消快递/打包费
    CANCEL_EXPRESS: (state) => {
        // state.cart.total_price -= +(state.cart.express && state.cart.express.expressFee)
        // state.cart.total_price = (+state.cart.total_price).toFixed(2)
        state.cart.express = ''
    },
    // 添加优惠
    ADD_REDUCE: (state, reduce) => {
        const {
            discountValue,
            discountType
        } = reduce
        state.cart.discountValue = discountValue
        state.cart.discountType = discountType
        // 计算已优惠的价格
        state.cart.reduceValue = getReduceValue(state.cart)
    },
    // 取消优惠
    CANCEL_REDUCE: (state) => {
        state.cart.discountValue = ''
        state.cart.discountType = ''
        state.cart.reduceValue = ''
    },
    // 添加业务员
    SET_SALES_MAN: (state, salesman) => {
        const {
            salesmanId,
            salesmanName
        } = salesman
        state.cart.salesmanId = salesmanId
        state.cart.salesmanName = salesmanName
    },
    // 重置购物车
    RESET_CART: (state) => {
        state.cart = {
            goods: [],
            total_price: '', // 实际支付金额
            discountValue: '', // 优惠价或折扣率
            discountType: '', // 优惠类型 整单折扣or整单减价
            reduceValue: '', // 已优惠价格
            express: '', // 物流信息
            note: '', // 备注
            customerId: '',
            customerCode: '',
            customerName: '',
            memberName: '', // 会员姓名
            memberPhone: '', // 会员电话
            settlementId: '',
            settlementCode: '',
            settlementName: '',
            salesmanId: '', // 业务员
            salesmanName: ''
        }
    },
    // 设置购物车结算后，接口返回数据
    SET_SETTLE_DATA: (state, obj) => {
        state.settle = obj
    }
}

const actions = {}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
