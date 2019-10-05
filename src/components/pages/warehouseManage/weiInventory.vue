<template>
  <div class="user-role">
    <zte-table-local
      ref="weiInventory"
      index-style="selection"
      :tableColumn="tableColumn"
      :table-data="detailData"
      :isSortable='false'
      @row-check="select">
      <template slot="bookCode" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.stop.native="viewImage(row)">{{ row.bookCode }}</el-button>
      </template>
      <div slot="content">
        <div  class="volume-Append">
          <div class="volume-input">
           <div class="title"> {{ $t('分册编号:') }}</div>
            <el-input
            v-model="volumeInput"
            clearable
            @keyup.enter.native="keyPress">
            </el-input>
          </div>
          <div class="volume-input">
            <div class="title"> {{ $t('温馨提示:') }}</div>
            <el-alert :title="msgAlert" :type="msgWarring ? 'error' : 'info'" style="padding:6px 8px" :closable="false"></el-alert>
          </div>
        </div>
        <el-button size="mini" @click.native="$emit('back')" icon="el-icon-arrow-left">{{ $t('返 回') }}</el-button>
        <el-button size="mini" @click.native="deleChecked(collectRow)">{{ $t('删除') }}</el-button>
        <el-button size="mini" @click.native="comfirm(collectRow)">{{ $t('确认盘点') }}</el-button>
      </div>
    </zte-table-local>

     <!-- 分册编号-->
    <el-dialog
      fullscreen
      class="allot-number"
      :title="$t('分册编号')"
      :append-to-body="true"
      :visible.sync="barcodeDialogVisible">
      <barcode
        class="barcode"
        v-for="item in printData"
        :key="item.bookCode"
        :value="item.bookCode"
        :text="item.bookCode"
        :width="2"
        :height="50"
        :text-margin="2"
        font-options=""
        :font-size="15"
        :margin="10"
        text-position="bottom"
        lineColor="#000000">
      </barcode>
      <el-button style="margin-bottom: 40px;" class="not-print" @click.native="printPage">{{$t('打印')}}</el-button>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'userRole',
  components: {
  },
  data() {
    return {
      volumeInput: '',
      msgAlert: '请在分册编号框中输入打印分册上的号码，按回车键追加，谢谢!',
      msgWarring: false,
      detailData: [],
      collectRow: [],
      barcodeDialogVisible: false,
      printData: [],
      tableColumn: [
        {
          code: 'bookCode',
          label: '分册编号',
          temp: 'bookCode',
        },
        {
          code: 'companyName',
          label: '结算单位',
        },
        {
          code: 'vouchertype',
          label: '凭证类型',
        },
        {
          code: 'periodName',
          label: '会计期间',
        },
        {
          code: 'bookstatus',
          label: '分册状态',
        },
        {
          code: 'inventorystatus',
          label: '盘点状态',
        },
        {
          code: 'inventoryDate',
          label: '最新盘点日期',
        },
        {
          code: 'empname',
          label: '最新盘点人',
        },
        {
          code: 'address',
          label: '存放地点',
        },
      ],
    };
  },
  methods: {
    // 勾选
    select(selection) {
      this.collectRow = selection;
    },
    // 删除
    deleChecked(collectRow) {
      if (collectRow.length) {
        this.detailData = [];
      } else {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
      }
    },
    keyPress() {
      this.$http.post('/ArchiveInventory/queryScanInventoryList', { bookCode: this.volumeInput }).then(
        (res) => {
          res = res.data;
          if (this.detailData[0]) {
            this.msgWarring = true;
            this.msgAlert = '分册已存在';
          }
          this.detailData = res.list;
        },
        () => {
          this.detailData = [];
          this.msgWarring = true;
          this.msgAlert = `分册编号${this.volumeInput}不在您管理库中，请核查`;
        },
      );
    },
    comfirm(collectRow) {
      if (this.collectRow.length !== 0) {
        this.$http.post('/ArchiveInventory/scanInventory', { bookIds: collectRow[0].id, bookCode: collectRow[0].bookCode }).then(
          (res) => {
            res = res.data;
            this.detailData = res.list;
          },
          () => {},
        );
      } else {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
      }
    },
    // 点击编号名查看图片
    viewImage(row) {
      window.open(`${window.location.pathname}#/bookView?bookId=${row.id}&imageNumber=${row.barcode}&bookCode=${row.bookCode}&type=none`);
    },
    printPage() {
      window.print();
    },
  },
};
</script>

<style lang="scss">
.user-role {
  height: 100%;
  .zte-table-local {
    height: 100%;
  }
  .allot-number .el-dialog__body {
    text-align: center;
    .barcode {
      text-align: center;
    }
  }
  .volume-Append {
    background-color: #fff;
    padding: 20px;
    margin: 10px 0px;
    vertical-align: middle;
    font-size: 14px;
    color: #606266;

    .volume-input {
      display: flex;
      flex-flow: row nowrap;
      width: 50%;
      padding-bottom: 10px;
      .title {
        width: 80px;
        margin-top: 8px;
      }
      .el-input {
        .el-input__inner {
          height: 28px;
        }
      }
    }
  }
}
</style>
