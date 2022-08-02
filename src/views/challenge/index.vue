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
      <template v-if="!popup" v-slot:search>
        <q-input outlined dense label="用户ID" v-model="query.user_id" />
        <q-input
          class="q-ml-md"
          outlined
          dense
          label="用户名"
          v-model="query.username"
        />
        <q-input
          class="q-ml-md"
          outlined
          dense
          label="挑战ID"
          v-model="query.challenge_id"
        />
      </template>
      <template v-slot:cell="{ props }">
        <q-td :props="props">
          <template v-if="props.col.name == 'status'">
            <template v-if="props.value == 1">
              <q-badge color="blue" label="待操作" />
            </template>
            <template v-if="props.value == 2">
              <q-badge color="red" label="已拒绝" />
            </template>
            <template v-if="props.value == 3">
              <q-badge color="yellow" label="正在进行中" />
            </template>
          </template>
          <template v-else-if="props.col.name == 'operate'">
            <!-- 非popup情况下 显示查看打卡 -->
            <q-btn
              v-if="!popup"
              @click="
                () => {
                  to_clockin(props.value);
                }
              "
              label="查看打卡"
              glossy
              color="primary"
            ></q-btn>
            <q-btn
              v-else
              @click="() => choose(props)"
              round
              color="black"
              icon="my_location"
            />
          </template>
          <template v-else>
            {{ props.value }}
          </template>
        </q-td>
      </template>
    </ZTable>
  </div>
</template>

<script setup>
import Challenge from "../../apis/challenge.js";
import pageMix from "../../utils/page.js";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const emit = defineEmits(["handleChooseChallenge"]);
const router = useRouter();
console.log(router.options.routes);

const props = defineProps({
  // popup为true时为一个弹窗辅助选择
  popup: {
    type: Boolean,
    default: false,
  },
  //作为弹窗时的查询
  user_id: {
    type: String,
    default: "",
  },
});
const choose = (data) => {
  emit("handleChooseChallenge", data);
};

const to_clockin = (path) => {
  router.push("/clockin?challenge_id=" + path);
};
const show = (data) => {
  console.log(data);
};
const beforeMount = () => {
  const route = useRoute(); // 第一步
  console.log("props", props.user_id);
  // props 下有user_id代表其为弹窗下的查询
  if (props.user_id && props.popup) {
    query.value.user_id = props.user_id;
  } else {
    //一般情况
    if (route.query.user_id) {
      query.value.user_id = route.query.user_id;
    }
    if (route.query.challenge_id) {
      query.value.challenge_id = route.query.challenge_id;
    }
  }
};

const query = ref({
  user_id: "",
  username: "",
  challenge_id: "",
});

const columns = [
  {
    name: "title",
    required: true,
    label: "标题",
    align: "left",
    field: "title",
  },
  {
    name: "desc",
    required: true,
    label: "详情",
    align: "left",
    field: "desc",
  },
  {
    name: "sponsor_reward",
    required: true,
    label: "积分(发起者打卡/每次)",
    align: "left",
    field: (row) => row.reward.sponsor,
  },
  {
    name: "sponsor_reward",
    required: true,
    label: "积分(受邀者打卡/每次)",
    align: "left",
    field: (row) => row.reward.invitee,
  },
  {
    name: "status",
    required: true,
    label: "状态",
    align: "left",
    field: "status",
  },
  {
    name: "operate",
    required: true,
    label: "操作",
    align: "left",
    field: (row) => row.id,
  },
];
const data_request = () => {
  const { user_id, username, challenge_id } = query.value;
  let _query = {
    from: stateData.pageProp.from,
    size: stateData.pageProp.size,
  };
  if (!!user_id) _query.user_id = user_id;
  if (!!username) _query.username = username;
  if (!!challenge_id) _query.challenge_id = challenge_id;
  return Challenge.list({ ..._query });
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
  query.value.username = "";
  query.value.user_id = "";
  query.value.challenge_id = "";
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
