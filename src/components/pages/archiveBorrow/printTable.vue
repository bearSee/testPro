<template>
  <div class="printTable">
    <div class="not-print" style="margin-top: 20px;">
      <el-button @click.native="printPage">{{$t('打印')}}</el-button>
      <el-button @click.native="back">{{$t('返回')}}</el-button>
    </div>
    <div
      class="print-all"
      v-for="(item, i) in printData"
      :key="i">
      <div>
        <div class="sortNum">
          <span>No.{{i + 1}}</span>
          <span size="small" class="headText">{{ $t('基本信息') }}</span>
        </div>
        <borrow-dialog-view
          :rowSize="3"
          :itemInfo="viewData.itemInfo"
          :form="ajaxData[i] ? ajaxData[i].form : {}"
          :tableColumn="viewData.tableColumn"
          :tableData="ajaxData[i] ? ajaxData[i].tableData : []"
          :uploadData="ajaxData[i] ? ajaxData[i].attachmentTableData : []"
          :closeBtn="false">
        </borrow-dialog-view>
        <zte-table
          request-url="/borrowProcessing/getErsApplyHistorie"
          index-style="index"
          :isPagination="false"
          :table-column="viewData.tableColumn"
          :params="{ id: item.id }">
          <div slot="content">
            <span size="small" class="headText">{{ $t('审批流程信息') }}</span>
          </div>
        </zte-table>
      </div>
      <div class="line"></div>
    </div>
  </div>
</template>

<script type='text/javascript'>
import borrowDialogView from '../../modules/borrow-dialog-view';

export default {
  name: 'printTable',
  components: { borrowDialogView },
  props: {
    printData: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      viewData: {
        itemInfo: [
          {
            code: 'applyNum',
            label: '借阅单号',
            type: 'label',
          },
          {
            code: 'employeeName',
            label: '借阅人',
            type: 'label',
          },
          {
            code: 'deptName',
            label: '部门',
            type: 'label',
          },
          {
            code: 'companyName',
            label: '公司名称',
            type: 'label',
          },
          {
            code: 'emailAddress',
            label: '邮箱',
            type: 'label',
          },
          {
            code: 'mobilePhone',
            label: '手机号码',
            type: 'label',
          },
          {
            code: 'applyDate',
            label: '申请日期',
            type: 'label',
          },
          {
            code: 'applyDesc',
            label: '借阅原因',
            type: 'label',
          },
          {
            code: 'applyType',
            label: '借阅类型',
            type: 'temp',
          },
        ],
        tableColumn: [
          {
            code: 'employeeName',
            label: '申请借阅凭证 ',
          },
          {
            code: 'approveDate',
            label: '审批日期',
          },
          {
            code: 'approveCommand',
            label: '处理结果',
          },
        ],
      },
      ajaxData: [],
      form: {},
      attachmentTableData: [],
      tableData: [],
    };
  },
  mounted() {
    this.getData(this.printData);
  },
  methods: {
    getData(data) {
      if (data.length) {
        data.forEach((params) => {
          const parameter = {
            employeeId: params.applyEmployeeId,
            applyNum: params.applyNum,
            id: params.id,
          };
          this.$http.post('/borrowProcessing/getApplyDetail', parameter).then(
            (res) => {
              this.form = Object.assign({}, { applyNum: params.applyNum }, res.data);
              this.attachmentTableData = res.data.applyFiles;
              this.tableData = res.data.applyDetails;
              this.ajaxData.push({
                form: this.form,
                attachmentTableData: this.attachmentTableData,
                tableData: this.tableData,
              });
            },
            () => {},
          );
        });
      } else {
        this.$message.warning(this.$t('请回退至原页面并重新点击进入当前页面!'));
      }
    },
    printPage() {
      window.print();
    },
    back() {
      this.$emit('back');
    },
    // printdiv() {
    //   const headstr = "<html><head><title></title></head><body>";
    //   const footstr = "</body>";
    //   const list = document.getElementsByClassName("print-all");
    //   let printData = '';
    //   for (let i = 0; i < list.length; i ++) {
    //     printData = printData + list[i].innerHTML + '<div style="page-break-after:always;"></div>';
    //   };
    //   var oldstr = document.body.innerHTML;
    //   document.body.innerHTML = headstr + printData + footstr;
    //   window.print();
    //   document.body.innerHTML = oldstr;
    //   return false;
    // }
  },
};
</script>

<style lang='scss'>
  .printTable{
      padding: 30px 40px;
      .not-print {
        position: relative;
        left: 40%;
        bottom: 30px;

      }
      .print-all {
        position: relative;
        page-break-after:always;
        .zte-table .bottom-body {
          background: #ffffff;
        }
      }
      .line {
        width: 100%;
        height: 40px;
        border-top: 1px dashed gray;
        // position: relative;
        // page-break-after:always;
      }
      .el-table {
        font-size: 14px;
      }
      .borrowReadpublic {
          padding: 0;
          .el-form {
              position: relative;
              top: 20px;
          }
      }
      .headText {
          margin: 0 10px;
          color: #606266;
          font-size: 14px;
      }
      .sortNum {
        margin-bottom: 20px;
      }
      .borrow-dialog-view {
        padding: 0;
        padding-bottom: 30px;
      }
  }
</style>
