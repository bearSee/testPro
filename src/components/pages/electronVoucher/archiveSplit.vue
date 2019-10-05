<template>
  <div class="archiveSplit">
    <zte-table
      ref="archiveSplit"
      index-style="selection"
      request-url="/archiveBook/list"
      excelUrl="/archiveBook/exportExcel"
      :buttonList="buttonList"
      :row-size="3"
      :search-info="searchConfig"
      :table-column="tableColumn"
      @search="search"
      >
      <template slot="content" slot-scope="{ rows }">
        <el-button size="small" @click.native="printVolumeCode(rows)">{{ $t('打印分册条码') }}</el-button>
      </template>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" :disabled="row.bookStatus === 'DESTROYED'" size="mini" @click.stop.native="view(row)">{{$t('查看')}}</el-button>
        <el-button type="text" :disabled="row.bookStatus !== 'BOOKED'" size="mini" @click.stop.native="change(row)">{{$t('修改')}}</el-button>
        <el-button type="text" :disabled="row.bookStatus !== 'BOOKED'" size="mini" @click.stop.native="separate(row)">{{$t('拆册')}}</el-button>
      </template>
      <template slot="bookCode" slot-scope="{ row }">
        <el-button type="text" size="mini" :disabled="row.bookStatus === 'DESTROYED'" @click.stop.native="viewImage(row)">{{ row.bookCode }}</el-button>
      </template>
      <template class="moreBtn" slot="moreOperate">
        <el-button size="mini" @click="voucherDisconnect">{{ $t('断号分册') }}</el-button>
        <el-button size="mini" @click.native="voucherContact">{{ $t('连号分册') }}</el-button>
      </template>
    </zte-table>
    <!-- 凭证连号/断号分册/修改弹窗,根据点击按钮传入不同的credentialData生成断号或连号分册弹窗界面 -->
    <el-dialog
      fullscreen
      class="credential"
      :title="$t(credentialData.title)"
      :visible.sync="credentialData.visible"
      :close-on-press-escape="false"
      @closed="whenClosed">
      <zte-form
        size="mini"
        ref="credentialForm"
        :rowSize="3"
        :rules="credentialData.rules || {}"
        :item-info="credentialData.listInfo"
        :form="credentialData.formData"
        :isSubmit='false'
        :isCancel='false'>

        <template slot="voucherNum" slot-scope="scope">
          <el-input
            v-model="scope.form.voucherNum"
            :placeholder="$t('请输入凭证编号，并按回车')"
            native-type="submit"
            @keyup.enter.native="submit(scope.form)"/>
        </template>

        <template slot="imageNumberBroken" slot-scope="scope">
          <el-input
            v-model="scope.form.imageNumberBroken"
            :placeholder="$t('请输入影像任务编号，并按回车')"
            native-type="submit"
            @keyup.enter.native="submit(scope.form)"/>
        </template>

        <!-- <template slot="imageNumber" slot-scope="scope">
          <el-input
            v-model="scope.form.imageNumber"
            :placeholder="$t('请输入影像任务编号，并按回车')"
            native-type="submit"
            @keyup.enter.native="submit(scope.form)"/>
        </template> -->

        <template slot="content">
          <el-form-item v-if="credentialData.tips" label="消息提示">
            <el-input :class="{ redFont }" disabled :value="tips"/>
          </el-form-item>
        </template>

        <template slot="allBook">
          <label>{{tableData.length}}</label>
        </template>

      </zte-form>

      <zte-table-local
        index-style="selection"
        :table-column="credentialData.tableColumn"
        :table-data="tableData"
        @row-check="select">


        <template slot="operate" slot-scope="{ row, $index }">
          <el-button type="text" @click.native="dele(row, $index)">{{ $t('删除') }}</el-button>
        </template>

        <div slot="content">
          <!-- <span size="small" class="headText">{{ $t('分册清单') }}</span> -->
          <el-button
            size="mini"
            style="width:80px"
            v-if="credentialData.hasAddBtn"
            native-type="submit"
            @click.native="add">
              {{$t('新增')}}
          </el-button>
          <el-button
            size="mini"
            style="width:80px"
            v-if="!credentialData.noDelBtn"
            @click.native="deleChecked(collectRow)">
              {{$t('删除')}}
          </el-button>
          <el-button size="mini" :loading="btnDisabled" type="primary" @click.native="bindingVolume(collectRow)">{{$t('装订成册')}}</el-button>
        </div>

        <template slot="serialNum" slot-scope="{ row }">
          <el-input size="mini" v-model="row.serialNum"></el-input>
        </template>
        <template slot="beginNum" slot-scope="{ row }">
          <zte-item
            size="mini"
            v-model="row[beginNumInfo.code]"
            :props="beginNumInfo"
            :show="row[beginNumInfo.showLabel]"
            @single-picker-change="beginNumChange($event, row)">
          </zte-item>
        </template>
        <template slot="endNum" slot-scope="{ row }">
          <zte-item
            size="mini"
            v-model="row[endNumInfo.code]"
            :props="endNumInfo"
            :show="row[endNumInfo.showLabel]"
            @single-picker-change="endNumChange($event, row)">
          </zte-item>
        </template>
        <template slot="bookSum" slot-scope="{ row }">
          <el-input size="mini" v-model="row.bookSum"></el-input>
        </template>
        <template slot="bookCount" slot-scope="{ row }">
          <el-input size="mini" v-model="row.bookCount"></el-input>
        </template>
      </zte-table-local>
      <el-button style="margin:20px 0 40px 0;" size="small" @click="back">{{$t('返回')}}</el-button>
    </el-dialog>

    <!-- 拆册弹窗 -->
    <el-dialog
      fullscreen
      class="apart"
      :title="$t(apart.title)"
      :visible.sync="apart.visible">
      <zte-table
        index-style="index"
        :request-url="apart.requestUrl"
        :params="apart.params"
        :table-column="apart.tableColumn">
        <div slot="content">
          <span size="small" class="headText">{{ $t('分册编号') + '：' + apart.bookNum }}</span>
        </div>
      </zte-table>
      <el-button type="primary" style="margin:20px 20px 40px 0;" size="small" @click="apartBook">{{$t('拆册')}}</el-button>
      <el-button style="margin:20px 0 40px 0;" size="small" @click="apart.visible = false">{{$t('返回')}}</el-button>
    </el-dialog>

     <!-- 条码-->
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

    <!-- 查看弹窗 -->
    <el-dialog
      fullscreen
      :title="$t('分册记录')"
      style="margin-bottom:20px;"
      :visible.sync="look.visible">
      <zte-table
        index-style="index"
        :isPagination="false"
        :request-url="apart.requestUrl"
        :params="apart.params"
        :table-column="apart.tableColumn">
        <div slot="content">
          <span size="small" class="headText">{{ $t('分册编号') + '：' + apart.bookNum }}</span>
        </div>
      </zte-table>
      <zte-table
        index-style="index"
        :request-url="look.requestUrl"
        :params="look.params"
        :table-column="look.tableColumn">
        <div slot="content">
          <span size="small" class="headText">{{ $t('分册历史记录') }}</span>
        </div>
      </zte-table>
      <el-button style="margin:20px 0 40px 0;" size="small" @click="look.visible = false">{{$t('返回')}}</el-button>
    </el-dialog>

  </div>
</template>

<script type='text/javascript'>
import mixins from '../../../mixins/publicMethods';
import zteItem from '../../modules/zte-item';
import barcode from '../../../es/barcodeUtil';
import compare from '../../../es/utils';

export default {
  name: 'archive-split',
  mixins: [mixins],
  components: {
    zteItem,
    barcode,
  },
  data() {
    const validate = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('请选择')));
      }
      return callback();
    };
    return {
      // 搜索框信息
      searchConfig: [
        {
          code: 'beginBookCode',
          label: '起始分册编号',
          type: 'text',
        },
        {
          code: 'endBookCode',
          label: '截止分册编号',
          type: 'text',
        },
        {
          code: 'periodName',
          label: '会计期间',
          type: 'select',
          options: [],
          optionProps: {
            label: 'periodName',
            value: 'periodName',
          },
          commonRequest: 'common/listPeriods',
        },
        {
          code: 'companyCode',
          label: '结算单位',
          // 需要显示的字段类型
          showLabel: 'companyName',
          type: 'table',
          // 后台key地址
          key: 'ComapanyLov.find',
          trans: [
            {
              // 将后台返回的COMPANY_CODE赋值给companyCode并在查询时当做参数
              to: 'companyCode',
              from: 'COMPANY_CODE',
            },
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
            },
          ],
        },
        {
          code: 'bookEmployeeId',
          label: '分册人',
          type: 'table',
          showLabel: 'bookEmployeeName',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'bookEmployeeName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'bookEmployeeId',
              from: 'ID',
            },
          ],
        },
        {
          code: 'bookStatus',
          label: '分册状态',
          type: 'select',
          options: [],
          fastCode: 'BOOK_STATUS',
        },
        {
          code: 'BookDate',
          label: '分册起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'beginBookDate',
          endCode: 'endBookDate',
          type: 'daterange',
        },
        // {
        //   code: 'beginBookDate',
        //   label: '起始分册日期',
        //   type: 'date',
        // },
        // {
        //   code: 'endBookDate',
        //   label: '截止分册日期',
        //   type: 'date',
        // },
      ],
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 150,
        },
        {
          code: 'bookCode',
          label: '分册编号',
          temp: 'bookCode',
          width: 220,
        },
        {
          code: 'companyName',
          label: '结算单位',
          width: 180,
        },
        {
          code: 'periodName',
          label: '会计期间',
        },
        {
          code: 'bookEmployeeName',
          label: '分册人',
          width: 90,
        },
        {
          code: 'bookDate',
          label: '分册日期',
          width: 140,
        },
        {
          code: 'bookStatusName',
          label: '分册状态',
        },
      ],
      // credentialData默认为空，当点击凭证断号分册按钮则将disconnect赋值给它，生成断号分册弹窗，同理生成连号分册弹窗数据
      credentialData: {},
      // 凭证断号分册数据
      disconnect: {
        // 根据凭证分册弹窗的搜索框输入搜索条件后请求到后台数据，生成分册清单表格内容
        tableData: [],
        formData: null,
        searchUrl: '/archiveBook/listVoucher',
        bindUrl: '/archiveBook/inContinuityBind',
        visible: false,
        title: '断号分册',
        isEncaps: true,
        isSubmit: true,
        tips: true,
        //  断号分册 表单label
        listInfo: [
          {
            code: 'companyCode',
            label: '结算单位',
            required: true,
            showLabel: 'companyName',
            type: 'table',
            key: 'ComapanyLov.find',
            trans: [
              {
                to: 'companyCode',
                from: 'COMPANY_CODE',
              },
              {
                to: 'companyName',
                from: 'COMPANY_NAME',
              },
            ],
          },
          {
            code: 'periodName',
            label: '会计期间',
            type: 'select',
            required: true,
            options: [],
            optionProps: {
              label: 'periodName',
              value: 'periodName',
            },
            ajax: 'common/listPeriods',
          },
          {
            code: 'voucherType',
            label: '凭证类型',
            required: true,
            type: 'select',
            options: [],
            fastCode: 'VOUCHER_TYPE',
          },
          {
            code: 'voucherNum',
            label: '凭证编号',
            // required: true,
            type: 'temp',
          },
          {
            code: 'imageNumberBroken',
            label: '影像任务编号',
            type: 'temp',
          },
          // {
          //   code: 'imageNumber',
          //   label: '影像任务编号',
          //   required: true,
          //   type: 'temp',
          // },
        ],
        // 断号分册 表格表头
        tableColumn: [
          {
            code: 'serialNum',
            label: '装订流水号',
            temp: 'serialNum',
          },
          {
            code: 'voucherNum',
            label: '凭证编号',
          },
          {
            code: 'barcode',
            label: '影像任务编号',
          },
          {
            code: 'periodName',
            label: '凭证期间',
          },
          {
            code: 'userName',
            label: '制单人',
          },
          // {
          //   code: 'operate',
          //   label: '操作',
          //   temp: 'operate',
          // },
        ],
      },
      tips: '请在凭证编号框中输入打印分册上的号码，按回车键追加，谢谢!',
      redFont: false,
      // 凭证连号分册数据
      contact: {
        tableData: [],
        formData: null,
        searchUrl: '/archiveBook/listVoucher',
        bindUrl: '/archiveBook/continuityBind',
        visible: false,
        title: '连号分册',
        isSubmit: false,
        // hasAddBtn为真，则弹窗表格上方添加新增按钮
        hasAddBtn: true,
        // 连号分册 表单label
        listInfo: [
          {
            code: 'companyCode',
            label: '结算单位',
            required: true,
            showLabel: 'companyName',
            type: 'table',
            key: 'ComapanyLov.find',
            trans: [
              {
                to: 'companyCode',
                from: 'COMPANY_CODE',
              },
              {
                to: 'companyName',
                from: 'COMPANY_NAME',
              },
            ],
          },
          {
            code: 'periodName',
            label: '会计期间',
            type: 'select',
            required: true,
            options: [],
            optionProps: {
              label: 'periodName',
              value: 'periodName',
            },
            ajax: 'common/listPeriods',
          },
          {
            code: 'voucherType',
            label: '凭证类型',
            required: true,
            type: 'select',
            options: [
              // {
              //   label: '发票凭证',
              //   value: 'AP',
              // },
              // {
              //   label: '付款凭证',
              //   value: 'FK',
              // },
              // {
              //   label: '记账凭证',
              //   value: 'JZ',
              // },
            ],
            fastCode: 'VOUCHER_TYPE',
          },
          {
            code: 'allBook',
            label: '装订总册',
            type: 'temp',
          },
        ],
        // 连号分册 表格表头
        tableColumn: [
          {
            code: 'serialNum',
            label: '装订流水号',
            temp: 'serialNum',
          },
          {
            code: 'beginNum',
            label: '起始凭证编号',
            temp: 'beginNum',
          },
          {
            code: 'endNum',
            label: '截止凭证编号',
            temp: 'endNum',
          },
          {
            code: 'bookSum',
            label: '本月总册数',
            temp: 'bookSum',
          },
          {
            code: 'bookCount',
            label: '本月分册数',
            temp: 'bookCount',
          },
        ],
        // 表单验证配置 获取用户输入
        rules: {
          companyCode: [
            { trigger: ['blur'], validator: validate },
          ],
          periodName: [
            { trigger: ['blur'], validator: validate },
          ],
          voucherType: [
            { trigger: ['blur'], validator: validate },
          ],
        },
      },
      // 分册弹窗按钮可操作
      btnDisabled: false,
      // 连号分册 表格中嵌入的输入框数据
      beginNumInfo: {
        code: 'beginNum',
        label: '起始凭证编号',
        showLabel: 'beginNum',
        type: 'table',
        required: true,
        key: 'VoucherLov.find',
        requestUrl: '/archiveBook/findLovDatas',
        trans: [
          {
            to: 'beginNum',
            from: 'VOUCHER_NUM',
          },
          {
            to: 'beginNumName',
            from: 'VOUCHER_NAME',
          },
        ],
        params: {},
      },
      endNumInfo: {
        code: 'endNum',
        label: '截止凭证编号',
        showLabel: 'endNum',
        type: 'table',
        required: true,
        key: 'VoucherLov.find',
        requestUrl: '/archiveBook/findLovDatas',
        trans: [
          {
            to: 'endNum',
            from: 'VOUCHER_NUM',
          },
          {
            to: 'endNumName',
            from: 'VOUCHER_NAME',
          },
        ],
      },
      // 拆册弹窗数据
      apart: {
        requestUrl: '/archiveBook/listVoucherByBookId',
        params: {},
        visible: false,
        bookNum: '',
        title: '拆册',
        // 拆册弹窗 表格表头
        tableColumn: [
          {
            code: 'voucherNum',
            label: '凭证编号',
          },
          {
            code: 'voucherTypeName',
            label: '凭证类型',
          },
          {
            code: 'companyName',
            label: '结算单位',
          },
          {
            code: 'periodName',
            label: '会计期间',
          },
          {
            code: 'userName',
            label: '制单人',
          },
          {
            code: 'userDate',
            label: '制单日期',
            type: 'date',
          },
          {
            code: 'approverName',
            label: '复核人',
          },
          {
            code: 'approverDate',
            label: '复核日期',
            type: 'date',
          },
          {
            code: 'voucherStatusName',
            label: '凭证状态',
          },
        ],
      },
      bookId: '',
      // 查看弹窗的数据
      look: {
        // 分册历史记录table
        requestUrl: '/archiveBook/listVoucherHistoryByBook',
        visible: false,
        params: {},
        // 查看弹窗 表格表头
        tableColumn: [
          {
            code: 'employeeName',
            label: '处理人',
          },
          {
            code: 'handleAction',
            label: '处理动作',
          },
          {
            code: 'handleDate',
            label: '处理时间',
          },
          {
            code: 'bookStatus',
            label: '分册状态',
          },
        ],
      },
      buttonList: {
        excel: true,
      },
      // 收集选中的行
      collectRow: [],
      // 收集搜索框查询条件
      crrentForm: {},
      tableData: [],
      // 当前流水号
      serialNum: 1,
      // 打印条码数据
      printData: [],
      barcodeDialogVisible: false,
    };
  },
  created() {
  },
  watch: {
    tableData(newVal) {
      if (this.credentialData.listInfo) {
        if (this.tableData.length) {
          this.credentialData.listInfo.forEach((item) => {
            item.disabled = true;
          });
        } else {
          this.credentialData.listInfo.forEach((item) => {
            item.disabled = false;
          });
        }
        this.credentialData.formData = this.$refs.credentialForm.currentForm;
        this.credentialData = JSON.parse(JSON.stringify(this.credentialData));
      }
      return newVal;
    },
  },
  methods: {
    // 获取选中的数据，并赋值给collectRow
    select(selection) {
      this.collectRow = selection;
      this.checkBookNum(selection);
    },
    // 凭证断号分册
    voucherDisconnect() {
      this.credentialData = this.disconnect;
      this.credentialData.formData = { periodName: this.getNowPeriod() };
      this.credentialData.visible = true;
    },
    // 凭证连号分册
    voucherContact() {
      this.credentialData = this.contact;
      this.credentialData.formData = { periodName: this.getNowPeriod() };
      this.credentialData.visible = true;
    },
    // 查看按钮
    view(row) {
      this.look.visible = true;
      this.apart.bookNum = row.bookCode;
      this.apart.params = { bookId: row.bookId };
      this.look.params = { bookId: row.bookId };
    },
    // 行数据操作-拆册按钮
    separate(row) {
      this.apart.bookNum = row.bookCode;
      this.apart.params = { bookId: row.bookId };
      this.apart.visible = true;
    },
    // 拆册
    apartBook() {
      this.$http.post('/archiveBook/unBindBook', this.apart.params).then(
        () => {
          this.$message({
            type: 'success',
            message: this.$t('拆册成功'),
          });
          this.apart.visible = false;
          this.apart.params = {};
          this.$refs.archiveSplit.getTableData();
        },
      ).catch(() => {
      });
    },
    // 修改按钮
    change(row) {
      this.bookId = row.bookId;
      if (row.bookType === 'VOUCHER_BREAK_BOOK') {
        this.credentialData = JSON.parse(JSON.stringify(this.disconnect));
        this.credentialData.listInfo[3].required = false;
      } else {
        this.credentialData = JSON.parse(JSON.stringify(this.contact));
        this.credentialData.noDelBtn = true;
      }
      this.credentialData.formData = row;
      this.crrentForm = {
        companyCode: row.companyCode,
        voucherType: row.voucherType,
        periodName: row.periodName,
      };
      // this.beginNumInfo.params = this.crrentForm;
      // this.endNumInfo.params = this.crrentForm;
      this.credentialData.hasAddBtn = false;
      this.credentialData.visible = true;
      this.$http.post('/archiveBook/listVoucherBookRelByBook', { bookId: row.bookId }).then(
        (res) => {
          this.tableData = res.data.list;
          if (res.data.list.length) {
            this.beginNumInfo.params = Object.assign({}, this.crrentForm, { beginNum: res.data.list[0].beginNum, endNum: res.data.list[0].endNum });
            this.endNumInfo.params = Object.assign({}, this.crrentForm, { beginNum: res.data.list[0].beginNum, endNum: res.data.list[0].endNum });
          }
        },
      ).catch(() => {
      });
    },
    // 点击编号名查看图片
    viewImage(row) {
      window.open(`${window.location.pathname}#/bookView?bookId=${row.bookId}&imageNumber=${row.barcode}&bookCode=${row.bookCode}&type=none`);
    },
    bindingVolume(row) {
      if (this.credentialData.isEncaps) {
        this.encaps(row);
        return;
      }
      this.bindBook(row);
    },
    // 断号分册 分装成册按钮
    encaps(row) {
      // 表单为空提示
      this.$refs.credentialForm.submitForm();
      if (this.checkForm(this.crrentForm) && row.length) {
        const baseParams = {
          companyCode: this.crrentForm.companyCode,
          periodName: this.crrentForm.periodName,
          voucherType: this.crrentForm.voucherType,
          inContinuityVoucherList: JSON.stringify(row.map(item => Object.assign({
            voucherId: item.voucherId,
            serialNum: item.serialNum,
          }))),
        };
        this.btnDisabled = true;
        const params = this.bookId ? Object.assign({}, baseParams, { bookId: this.bookId }) : baseParams;
        this.$http.post(this.credentialData.bindUrl, params).then(
          () => {
            this.back();
            this.$message({
              type: 'success',
              message: this.$t('装订成功'),
            });
          },
        ).catch(() => {
          this.btnDisabled = false;
        });
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('请将表单填写完整并勾选分册清单数据'),
        });
      }
    },
    // 连号分册 装订成册按钮
    bindBook(row) {
      // 表单为空提示
      this.$refs.credentialForm.submitForm();
      if (this.checkForm(this.crrentForm) && this.checkArr(row)) {
        if (this.checkBookNum(row)) {
          const baseParams = {
            companyCode: this.crrentForm.companyCode,
            periodName: this.crrentForm.periodName,
            voucherType: this.crrentForm.voucherType,
            continuityVoucherList: JSON.stringify(row.map(item => Object.assign({
              // voucherId: item.voucherId,
              serialNum: item.serialNum,
              beginNum: item.beginNum,
              endNum: item.endNum,
              bookSum: item.bookSum,
              bookCount: item.bookCount,
            }))),
          };
          this.btnDisabled = true;
          const params = this.bookId ? Object.assign({}, baseParams, { bookId: this.bookId }) : baseParams;
          this.$http.post(this.credentialData.bindUrl, params).then(
            () => {
              this.back();
              this.$message({
                type: 'success',
                message: this.$t('装订成功'),
              });
            },
          ).catch(() => {
            this.btnDisabled = false;
          });
        }
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('请将表单填写完整并勾选分册清单数据'),
        });
      }
    },
    // 连号凭证分册时，起止凭证编号不能大于截止编号
    checkBookNum(arr) {
      let bool = true;
      arr.forEach((item) => {
        bool = compare(item.beginNum, item.endNum);
        if (!bool) {
          this.$message.warning(this.$t('截止分册编号不可小于起始分册编号!'));
        }
      });
      return bool;
    },
    // back返回 初始化数据
    back() {
      this.credentialData.visible = false;
    },
    // 弹窗关闭前回调
    whenClosed() {
      this.contact.listInfo.forEach((item) => {
        item.disabled = false;
      });
      this.disconnect.listInfo.forEach((item) => {
        item.disabled = false;
      });
      this.bookId = '';
      this.btnDisabled = false;
      this.credentialData = {};
      this.collectRow = [];
      this.crrentForm = {};
      this.tableData = [];
      this.serialNum = 1;
      this.redFont = false;
      this.tips = '请在凭证编号框中输入打印分册上的号码，按回车键追加，谢谢!';
      this.$refs.archiveSplit.getTableData();
    },
    // 新增按钮  弹窗-连号分册中
    add() {
      // 表单为空提示
      this.$refs.credentialForm.submitForm();
      const form = this.$refs.credentialForm.currentForm;
      this.crrentForm = {
        companyCode: form.companyCode,
        voucherType: form.voucherType,
        periodName: form.periodName,
      };
      if (this.checkForm(this.crrentForm) && Object.keys(this.crrentForm).length > 2) {
        this.beginNumInfo.params = this.crrentForm;
        this.endNumInfo.params = this.crrentForm;
        this.tableData = [...this.tableData, {
          serialNum: this.tableData.length + 1,
          beginNum: '',
          endNum: '',
          bookSum: '',
          bookCount: '',
        }];
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('请将表单填写完整'),
        });
      }
    },
    // 弹窗-凭证断号 删除按钮
    dele(row, index) {
      this.tableData.splice(index, 1);
      this.tableData.forEach((d, i) => {
        d.serialNum = i + 1;
      });
    },
    // 删除所选
    deleChecked(collectRow) {
      if (collectRow.length) {
        collectRow.forEach((item) => {
          const boolNum = this.tableData.indexOf(item);
          if (boolNum !== -1) {
            this.tableData.splice(boolNum, 1);
            this.tableData.forEach((d, i) => {
              d.serialNum = i + 1;
            });
          }
        });
      } else {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
      }
    },
    // 检查表单搜索条件是否为空
    checkForm(form) {
      const arr = ['voucherNum', 'imageNumberBroken'];
      if (Object.keys(form).length) {
        for (const key in form) {
          if (form[key] === '' && arr.indexOf(key) === -1) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    // 检查分册清单数组内必填项
    checkArr(arr) {
      if (arr.length) {
        let bool = true;
        arr.forEach((item) => {
          if (item.beginNum === '' || item.endNum === '') {
            bool = false;
          }
        });
        return bool;
      }
      return false;
    },
    // 回车搜索分册列表
    submit(form) {
      const { tableData, credentialData } = this;
      if (tableData.length && this.isDuplicationVoucher(form)) {
        this.redFont = true;
        this.tips = '凭证已存在!';
        return;
      }
      this.$refs.credentialForm.submitForm();
      if (this.checkForm(form)) {
        this.crrentForm = {
          companyCode: form.companyCode,
          voucherType: form.voucherType,
          voucherNum: form.voucherNum,
          imageNumberBroken: form.imageNumberBroken,
          periodName: form.periodName,
        };
        this.$http.post(credentialData.searchUrl, form).then(
          ({ data }) => {
            this.redFont = false;
            this.tips = '请在凭证编号框中输入打印分册上的号码，按回车键追加，谢谢!';
            this.$refs.credentialForm.currentForm = Object.assign({}, this.$refs.credentialForm.currentForm, { voucherNum: '', imageNumberBroken: '' });
            if (tableData.length) {
              let bool = true;
              const appendList = [];
              tableData.forEach((item) => {
                if (item.voucherNum === form.voucherNum) bool = false;
                if (!data.list.find(d => d.voucherId === item.voucherId)) appendList.push(item);
              });
              if (bool) {
                this.tableData = appendList.concat(data.list).map((item, i) => Object.assign(item, { serialNum: i + 1 }));
              }
            } else {
              this.tableData = [...data.list.map((item, i) => Object.assign(item, { serialNum: i + 1 }))];
            }
          },
        ).catch((err) => {
          this.redFont = true;
          this.tips = err.data.message;
        });
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('请将表单填写完整'),
        });
      }
    },
    // 查询凭证是否重复
    isDuplicationVoucher(form) {
      // 是否在table中可查
      const isInTable = this.tableData.some(item => item.voucherNum === form.voucherNum || item.barcode === form.imageNumberBroken);
      return isInTable;
    },
    // 选择截止凭证编号
    beginNumChange(obj, row) {
      // row.voucherNum = obj.voucherNum;
      row[this.beginNumInfo.showLabel] = obj[this.beginNumInfo.showLabel];
      row[this.beginNumInfo.code] = obj[this.beginNumInfo.code];
    },
    endNumChange(obj, row) {
      // row.voucherNum = obj.voucherNum;
      row[this.endNumInfo.showLabel] = obj[this.endNumInfo.showLabel];
      row[this.endNumInfo.code] = obj[this.endNumInfo.code];
    },
    // 打印分册条码
    printVolumeCode(rows) {
      if (rows.length) {
        this.printData = rows;
        this.barcodeDialogVisible = true;
      } else {
        this.$message.warning(this.$t('请至少勾选一条数据！'));
      }
    },
    printPage() {
      window.print();
    },
    search(form) {
      const bool = compare(form.beginBookCode, form.endBookCode);
      if (!bool) {
        this.$message.warning(this.$t('截止分册编号不可小于起始分册编号!'));
      }
    },
  },
};
</script>

<style lang='scss'>

.allot-number .el-dialog__body {
  text-align: center;
  .barcode {
    text-align: center;
  }
}
.archiveSplit{
  .credential{
    // height: 100%;
    .el-dialog{
      flex-direction: column;
      .el-dialog__body {
        // overflow auto
        .zte-form{
          .btn-group {
            margin-top: 20px;
          }
          .button-list{
            .moreBtn{
              margin-left: 10px;
              float: right;
            }
          }
          .content{
            width: 33%;
            float: left;
            .el-form-item--mini{
              width: 100%;
              float: left;
              .el-form-item__content{
                .el-input__inner{
                  color: grey;
                }
              }
              .redFont{
                .el-input__inner{
                  color: #dc6262;
                }
              }
            }
          }
        }
        .zte-table-local{
          .table-body{
            .el-table__body-wrapper{
              .cell{
                width: 80%;
              }
            }
          }
        }
      }
    }
  }
}
</style>
