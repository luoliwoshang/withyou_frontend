<template>
  <div class="q-pa-md">
    <ZTable
      :dataResource="stateData.tableData"
      :pageProp="stateData.pageProp"
      :loading="stateData.loading"
      :columns="columns"
      :beforeMount="beforeMount"
      @on-request="handleRequest"
      @on-resize="handleSizeChange"
      @on-page="handleCurrentChange"
      @on-reset="handleReset"
    >
      <template v-slot:search>
        <q-input
          class="q-mr-md"
          outlined
          dense
          label="用户ID"
          v-model="query.user_id"
        />
      </template>
      <template v-slot:cell="{ props }">
        <q-td :props="props">
          <template v-if="props.col.name == 'operate'">
            <q-btn
              @click="() => set_sale_status(props, 'take_down')"
              :disabled="props.row.status == 1"
              :label="props.row.status == 0 ? '去收货' : '已收货'"
              push
              icon="arrow_circle_down"
            />
            <!--
            <q-btn
              class="q-ml-md"
              @click="
                () => {
                  show_clockin_image(props.row.images);
                }
              "
              :disabled="props.row.images.length == 0"
              label="打卡图片"
              glossy
              color="pink"
            ></q-btn>
            -->
          </template>

          <template v-else>
            {{ props.value }}
          </template>
        </q-td>
      </template>
    </ZTable>
    <q-dialog v-model="clockin_images_show">
      <q-carousel
        style="width: 400px"
        transition-prev="scale"
        transition-next="scale"
        swipeable
        animated
        control-color="white"
        navigation
        arrows
        height="300px"
        class="bg-primary text-white shadow-1 rounded-borders"
        v-model="slide"
      >
        <q-carousel-slide
          v-for="(item, index) in clockin_images"
          :key="item"
          :name="index"
        >
          <img :src="item" style="width: 100%; height: 100%" />
        </q-carousel-slide>
      </q-carousel>
    </q-dialog>
  </div>
</template>

<script setup>
import moment from "moment";
import Purchased from "../../apis/purchased.js";
import pageMix from "../../utils/page.js";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Server from "../../utils/server.js";
const router = useRouter();
const show = (data) => {
  console.log(data);
  return data;
};
const beforeMount = () => {
  const route = useRoute(); // 第一步
  if (route.query.user_id) {
    query.value.user_id = route.query.user_id;
  }
};

const getImg = () => {
  Server.get(
    process.env.VUE_APP_API_BASE_URL +
      "/common/download?name=clock_in_images\\clock_in_images-1658648268905.png",
    {
      headers: {
        token: localStorage.getItem("token"),
      },
      //设定接收类型为blob,头部什么的自行添加
      responseType: "blob",
    }
  );
};
const clockin_images_show = ref(false);
const slide = ref(0);
const clockin_images = ref([]);

const show_clockin_image = (images) => {
  slide.value = 0;
  console.log(images);
  clockin_images_show.value = true;
  clockin_images.value = [];
  // getImg();
  clockin_images.value.push(
    ...images.map(
      (item) =>
        process.env.VUE_APP_API_BASE_URL + "/common/download?name=" + item
    )
  );
  console.log(clockin_images.value);
};

const columns = [
  {
    name: "title",
    required: true,
    label: "商品名",
    align: "left",
    field: (row) => row.good_info.title,
  },
  {
    name: "description",
    required: true,
    label: "商品描述",
    align: "left",
    field: (row) => row.good_info.desc,
  },
  {
    name: "buyer",
    required: true,
    label: "买家",
    align: "left",
    field: (row) => row.buyer_info.username,
  },
  {
    name: "owner",
    required: true,
    label: "卖家",
    align: "left",
    field: (row) => row.owner_info.username,
  },
  {
    name: "time",
    required: true,
    label: "购入时间",
    align: "center",
    field: (row) => moment(row.timestamp).format("yyyy年M月DD日 HH:mm:ss "),
  },
  {
    name: "operate",
    required: true,
    label: "操作",
    align: "center",
    field: (row) => ({ user_id: row.user_id }),
  },
];
const query = ref({
  user_id: "",
});
const set_sale_status = (props, api) => {
  const { owner_id, id } = props.row;
  Purchased[api]({
    owner_id,
    id,
  }).then((res) => {
    handleRequest();
  });
};

const data_request = () => {
  const { user_id } = query.value;
  let _query = {
    from: stateData.pageProp.from,
    size: stateData.pageProp.size,
  };
  if (!!user_id) _query.buyer_id = user_id;
  return Purchased.list({ ..._query });
};
const data_response = (data) => {
  console.log(data);
  stateData.tableData = data.list;
  stateData.pageProp.total = data.page.total;
};
const data_error = (error) => {
  console.log("error", error);
};
const data_reset = () => {
  query.value.user_id = "";
};

//mixin
const {
  stateData,
  handleSizeChange,
  handleCurrentChange,
  handleRequest,
  handleReset,
} = pageMix({
  data_request,
  data_response,
  data_error,
  data_reset,
});
</script>
