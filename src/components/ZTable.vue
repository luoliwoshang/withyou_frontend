<template>
  <div class="z-table-wrapper">
    <div
      class="z-table-header flex justify-end border-2 p-2 rounded-t-md border-b-0"
    >
      <!--  
      <div class="z-table-header-content flex-1">
        <slot name="header-content"></slot>
      </div>
      <div class="z-table-operate">
        <ZButton class="mx-1" type="primary" @click="handleRequest"
          >查询</ZButton
        >
        <ZButton class="mx-1" type="secondary" @click="handleReset"
          >重置</ZButton
        >
      </div>
        -->
    </div>
    <div class="z-table-main">
      <q-table
        :loading="loading"
        :rows="dataResource"
        :columns="columns"
        :pagination="pagination"
      >
        <!-- 加载 -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <!-- 底部分页 -->
        <template v-slot:bottom>
          <div class="z-table-pagination flex justify-right">
            <q-select
              style="width: 70px"
              dense
              :options="page.sizes"
              v-model="page.size"
              label="每页数量"
            />
            <q-pagination
              v-model="page.page"
              :max="page.total"
              boundary-links
              direction-links
            />
          </div>
        </template>
        <!-- 头部 -->
        <template v-if="slotSearch" v-slot:top>
          <div class="flex justify-between" style="width: 100%">
            <div class="z-table-search q-mr-md" style="flex: 1">
              <slot name="search"></slot>
            </div>
            <div class="operation">
              <q-btn push color="primary" label="搜索" @click="handleRequest" />
              <q-btn
                class="q-ml-xs"
                push
                color="white"
                text-color="primary"
                label="重置"
                @click="handleReset"
              />
            </div>
          </div>
        </template>
        <!-- 单个表格 -->
        <template v-slot:body-cell="props" v-if="slotCell">
          <slot :props="props" name="cell"> </slot>
        </template>
        <!-- 空状态 -->
        <template v-slot:no-data="{ icon, message, filter }">
          <div style="height: 300px" class="full-width flex column flex-center">
            <div class="full-width row flex-center text-accent q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span class="text-h6"> 没得数据</span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>
<script setup>
/**
 ** @description:ZTable组件
 ** @dataResource {array} 数据源
 ** @param columns {array} 列配置
 **               prop: 列属性
 **               label: 列标题
 **               slot: 该prop是否使用插槽,使用插槽时,需要在columns中配置slot: true
 ** @param loading {boolean} 是否加载中
 ** @param pageProp {object} 分页属性
 **            page: 当前页
 **            limit: 每页条数
 **            total: 总条数
 **            sizes: 每页条数选项 [10, 20, 30, 40, 50]
 ** @param handleRequest {function} 查询事件
 ** @param handleSizeChange {function} 每页条数改变事件
 **              size: 每页条数
 ** @param handleCurrentChange {function} 当前页改变事件
 **              current: 当前页
 ** @param handleReset {function} 重置事件
 */

import { defineProps, defineEmits, computed, ref, reactive } from "vue";
import { onMounted, onUnmounted, onBeforeMount, watch } from "vue";
import { useSlots } from "vue";

const props = defineProps({
  dataResource: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pageProp: {
    type: Object,
    default: () => {
      return {
        from: 0,
        size: 10,
        total: 0,
        sizes: [10, 20, 50, 100, 200],
      };
    },
  },
  selection: {
    type: String,
    default: "",
  },
  beforeMount: {
    type: Function,
    default: () => {},
  },
});

const emit = defineEmits([
  "on-request",
  "on-reset",
  "on-page",
  "on-resize",
  "on-before-mount",
]);

// slots
const slots = useSlots();
const slotSearch = !!slots.search;
const slotCell = !!slots.cell;
// slots

//  page
const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 9999,
});
const page = ref({
  page: 0, //第几页
  total: 10, //总页数
  size: 10,
  sizes: [],
});

onMounted(() => {
  props.beforeMount();
  handleRequest();
});
watch(props.pageProp, (_new, _old) => {
  const { from, size, total, sizes } = props.pageProp;

  page.value.size = size;
  page.value.sizes = sizes;

  page.value.total = Math.ceil(total / size);
  page.value.page = Math.floor(from / size) + 1;

  pagination.value.rowsPerPage = size;
});
watch(
  () => page.value.page,
  (_new, _old) => {
    if (_old != 0) {
      handleCurrentChange((_new - 1) * page.value.size);
    }
  }
);
watch(
  () => page.value.size,
  (_new, _old) => {
    if (_old != undefined) {
      pagination.value.rowsPerPage = _new;
      handleSizeChange(_new);
    }
  }
);
const show = (scope) => {
  console.log(scope);
};

const handleRequest = () => {
  emit("on-request");
};
const handleReset = () => {
  emit("on-reset");
};
const handleSizeChange = (size) => {
  console.log("ZTable resize change");
  emit("on-resize", size);
};
const handleCurrentChange = (current) => {
  emit("on-page", current);
};
</script>
<style lang="scss" scope>
.z-table-search {
  display: flex;
  & > div,
  & > label {
    flex: 1;
  }
}
</style>
