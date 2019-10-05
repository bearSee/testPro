

const index = () => import(/* webpackChunkName: "index" */ '@/components/pages/index');

// 与我相关
const myApply = () => import(/* webpackChunkName: "myApply" */ '@/components/pages/relatedMe/myApply');
const myApproval = () => import(/* webpackChunkName: "myApproval" */ '@/components/pages/relatedMe/myApproval');
const personalInfo = () => import(/* webpackChunkName: "personalInfo" */ '@/components/pages/relatedMe/personalInfo');


// 电子影像
const imageQuery = () => import(/* webpackChunkName: "imageQuery" */ '@/components/pages/electronImage/imageQuery');
const imageRoutingInspection = () => import(/* webpackChunkName: "imageRoutingInspection" */ '@/components/pages/electronImage/imageRoutingInspection');


// 电子凭证
const voucherCollect = () => import(/* webpackChunkName: "voucherCollect" */ '@/components/pages/electronVoucher/voucherCollect');
const voucherMatching = () => import(/* webpackChunkName: "voucherMatching" */ '@/components/pages/electronVoucher/voucherMatching');
const voucherReview = () => import(/* webpackChunkName: "voucherReview" */ '@/components/pages/electronVoucher/voucherReview');
const archiveSplit = () => import(/* webpackChunkName: "archiveSplit" */ '@/components/pages/electronVoucher/archiveSplit');
const archiveInbound = () => import(/* webpackChunkName: "archiveInbound" */ '@/components/pages/electronVoucher/archiveInbound');
const archiveTransfer = () => import(/* webpackChunkName: "archiveTransfer" */ '@/components/pages/electronVoucher/archiveTransfer');
const archiveAccept = () => import(/* webpackChunkName: "archiveAccept" */ '@/components/pages/electronVoucher/archiveAccept');


// 档案借阅
const borrowApply = () => import(/* webpackChunkName: "borrowApply" */ '@/components/pages/archiveBorrow/borrowApply');
const borrowProcessing = () => import(/* webpackChunkName: "borrowProcessing" */ '@/components/pages/archiveBorrow/borrowProcessing');

// 查询统计
const voucherQuery = () => import(/* webpackChunkName: "voucherQuery" */ '@/components/pages/queryStatistics/voucherQuery.vue');
const volumQuery = () => import(/* webpackChunkName: "volumQuery" */ '@/components/pages/queryStatistics/volumQuery');
const borrowRecord = () => import(/* webpackChunkName: "borrowRecord" */ '@/components/pages/queryStatistics/borrowRecord');
// const organizationMessage = () => import(/* webpackChunkName: "organizationMessage" */ '@/components/pages/queryStatistics/organizationMessage');

// 库房管理
const archiveCount = () => import(/* webpackChunkName: "archiveCount" */ '@/components/pages/warehouseManage/archiveCount');
const archiveDestroy = () => import(/* webpackChunkName: "archiveDestroy" */ '@/components/pages/warehouseManage/archiveDestroy');

const depotManage = () => import(/* webpackChunkName: "depotManage" */ '@/components/pages/systemManage/depotManage');
const fastCode = () => import(/* webpackChunkName: "fastCode" */ '@/components/pages/systemManage/fastCode');
const codeRule = () => import(/* webpackChunkName: "codeRule" */ '@/components/pages/systemManage/codeRule');

// 系统管理-定时管理、人员信息
const timerManager = () => import(/* webpackChunkName: "timerManager" */ '@/components/pages/systemConfig/timerManager');
const peopleInfo = () => import(/* webpackChunkName: "peopleInfo" */ '@/components/pages/systemConfig/peopleInfo');

// 权限管理-权限层次
const queryLevel = () => import(/* webpackChunkName: "queryLevel" */ '@/components/pages/authorityManager/queryLevel');
// 权限管理-角色管理
const roleManager = () => import(/* webpackChunkName: "roleManager" */ '@/components/pages/authorityManager/roleManager');
const userRole = () => import(/* webpackChunkName: "userRole" */ '@/components/pages/authorityManager/userRole');
const userFunc = () => import(/* webpackChunkName: "userFunc" */ '@/components/pages/authorityManager/userFunc');

const routerPages = {
  index: { path: '/index', component: index, name: '主页' },
  // 我的申请
  '/MY_APPLICATION': { path: '/myApply', component: myApply, name, meta: { keepAlive: true, requirAuth: true } },
  // 我的审批
  '/MY_APPROVAL': { path: '/myApproval', component: myApproval, name, meta: { keepAlive: true, requirAuth: true } },
  // 个人信息
  '/PERSONAL_INFO': { path: '/personalInfo', component: personalInfo, name, meta: { keepAlive: true, requirAuth: true } },
  // 影像查询
  '/IMAGE_QUERY': { path: '/imageQuery', component: imageQuery, name, meta: { keepAlive: true, requirAuth: true } },
  // 影像巡检
  '/IMAGE_INSPECTION': { path: '/imageRoutingInspection', component: imageRoutingInspection, name, meta: { keepAlive: true, requirAuth: true } },
  // 凭证采集
  '/VOUCHER_COLLECT': { path: '/voucherCollect', component: voucherCollect, name, meta: { keepAlive: true, requirAuth: true } },
  // 凭证匹配
  '/VOUCHER_MATCHING': { path: '/voucherMatching', component: voucherMatching, name, meta: { keepAlive: true, requirAuth: true } },
  // 凭证复审
  '/VOUCHER_REVIEW': { path: '/voucherReview', component: voucherReview, name, meta: { keepAlive: true, requirAuth: true } },
  // 凭证分册
  '/VOUCHER_DIVISION': { path: '/archiveSplit', component: archiveSplit, name, meta: { keepAlive: true, requirAuth: true } },
  // 档案入库
  '/ARCHIVES_PUT': { path: '/archiveInbound', component: archiveInbound, name, meta: { keepAlive: true, requirAuth: true } },
  // 档案调拨
  '/ARCHIVES_ALLOCATION': { path: '/archiveTransfer', component: archiveTransfer, name, meta: { keepAlive: true, requirAuth: true } },
  // 档案接收
  '/ARCHIVES_RECEIVE': { path: '/archiveAccept', component: archiveAccept, name, meta: { keepAlive: true, requirAuth: true } },
  // 借阅申请
  '/LOAN_APPLICATION': { path: '/borrowApply', component: borrowApply, name, meta: { keepAlive: true, requirAuth: true } },
  // 借阅处理
  '/LOAN_HANDLE': { path: '/borrowProcessing', component: borrowProcessing, name, meta: { keepAlive: true, requirAuth: true } },
  // 凭证查询
  '/VOUCHER_QUERY': { path: '/voucherQuery', component: voucherQuery, name, meta: { keepAlive: true, requirAuth: true } },
  // 凭证分册查询
  '/VOUCHER_DIVISION_QUERY': { path: '/volumQuery', component: volumQuery, name, meta: { keepAlive: true, requirAuth: true } },
  // 凭证借阅记录
  '/VOUCHER_LOAN_QUERY': { path: '/borrowRecord', component: borrowRecord, name, meta: { keepAlive: true, requirAuth: true } },
  // 仓库管理
  '/WAREHOUSE_MANAGEMENT': { path: '/depotManage', component: depotManage, name, meta: { keepAlive: true, requirAuth: true } },
  // 快速编码
  '/LOOKUP': { path: '/fastCode', component: fastCode, name, meta: { keepAlive: true, requirAuth: true } },
  // 编码规则
  '/CODE_RULE': { path: '/codeRule', component: codeRule, name, meta: { keepAlive: true, requirAuth: true } },
  // 档案盘点
  '/ARCHIVES_INVENTORY': { path: '/archiveCount', component: archiveCount, name, meta: { keepAlive: true, requirAuth: true } },
  // 档案销毁
  '/ARCHIVES_DESTROY': { path: '/archiveDestroy', component: archiveDestroy, name, meta: { keepAlive: true, requirAuth: true } },
  // 定时管理
  '/TASK_MANAGER': { path: '/timerManager', component: timerManager, name, meta: { keepAlive: true, requirAuth: true } },
  // 人员信息
  '/EMPLOYEE_REPORT': { path: '/peopleInfo', component: peopleInfo, name, meta: { keepAlive: true, requirAuth: true } },
  // 权限层次
  '/POSITION_STRUCTURE': { path: '/queryLevel', component: queryLevel, name, meta: { keepAlive: true, requirAuth: true } },
  // 角色管理
  '/ROLE_MANAGER': { path: '/roleManager', component: roleManager, name, meta: { keepAlive: true, requirAuth: true } },
  // 用户角色
  '/USER_ROLE': { path: '/userRole', component: userRole, name, meta: { keepAlive: true, requirAuth: true } },
  // 用户资源
  '/USER_FUNC': { path: '/userFunc', component: userFunc, name, meta: { keepAlive: true, requirAuth: true } },
};

export default routerPages;
