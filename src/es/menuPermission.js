
const defConfig = {
  'F010000': {
    icon: 'user',
    // name: '与我有关',
  },
  'F010100': {
    // name: '我的申请',
    path: '/myApply',
  },
  'F010200': {
    // name: '我的审批',
    path: '/myApproval',
  },
  'F010300': {
    // name: '个人信息',
    path: '/personalInfo',
  },
  'F020000': {
    icon: 'electron-image',
    // name: '电子影像',
  },
  'F020100': {
    // name: '影像查询',
    path: '/imageQuery',
  },
  'F020200': {
    // name: '影像巡检',
    path: '/imageRoutingInspection',
  },
  'F030000': {
    // name: '电子凭证',
    icon: 'batch',
  },
  'F030100': {
    // name: '凭证匹配',
    path: '/voucherMatching',
  },
  'F030200': {
    // name: '凭证复审',
    path: '/voucherReview',
  },
  'F030300': {
    // name: '凭证分册',
    path: '/archiveSplit',
  },
  'F040000': {
    // name: '档案借阅',
    icon: 'search',
  },
  'F040100': {
    // name: '借阅申请',
    path: '/borrowApply',
  },
  'F040200': {
    // name: '借阅处理',
    path: '/borrowProcessing',
  },
  'F050000': {
    // name: '查询统计',
    icon: 'menu-data',
  },
  'F050100': {
    // name: '凭证查询',
    path: '/voucherQuery',
  },
  'F050200': {
    // name: '凭证分册查询',
    path: '/volumQuery',
  },
  'F050300': {
    // name: '凭证借阅记录',
    path: '/borrowRecord',
  },
  'F060000': {
    // name: '库房管理',
    icon: 'set',
  },
  'F060100': {
    // name: '档案入库',
    path: '/archiveInbound',
  },
  'F060200': {
    // name: '档案调拨',
    path: '/archiveTransfer',
  },
  'F060300': {
    // name: '档案接收',
    path: '/archiveAccept',
  },
  'F060400': {
    // name: '档案销毁',
    path: '/archiveDestroy',
  },
  'F060500': {
    // name: '档案盘点',
    path: '/archiveCount',
  },
  'F070000': {
    icon: 'system-config',
    // name: '系统配置',
  },
  'F070100': {
    // name: '仓库管理',
    path: '/depotManage',
  },
  'F070200': {
    // name: '快速编码',
    path: '/fastCode',
  },
  'F070300': {
    // name: '编码规则',
    path: '/codeRule',
  },
  'F080000': {
    icon: 'system-manage',
    // name: '系统管理',
  },
  'F080100': {
    // name: '定时管理',
    path: '/timerManager',
  },
  'F080200': {
    // name: '人员信息',
    path: '/peopleInfo',
  },
  'F090000': {
    icon: 'auth-manage',
    // name: '权限管理',
  },
  'F090100': {
    // name: '权限层次',
    path: '/queryLevel',
  },
  'F090200': {
    // name: '角色管理',
    path: '/roleManager',
  },
  'F090300': {
    // name: '用户角色',
    path: '/userRole',
  },
  'F090400': {
    // name: '用户资源',
    path: '/userFunc',
  },
};

export default function getMenu(menu = [], rootNodeId = 'F000000', selfNodeName = 'id', parentNodeName = 'parentId', addConfig = defConfig) {
  const arr = [];
  menu.forEach((item, i) => {
    if (item[parentNodeName] === rootNodeId) {
      const children = getMenu(menu, item[selfNodeName], selfNodeName, parentNodeName, addConfig);
      if (children.length) item.children = children;
      item = Object.assign(item, addConfig[item[selfNodeName]] || {});
      arr.push(item);
    }
  });
  return arr;
}
/*
@addConfig 附加配置，后台传过来的菜单可能缺少图标等
addConfig: {
  F010000: {},
  F000100: {},
}
*/


