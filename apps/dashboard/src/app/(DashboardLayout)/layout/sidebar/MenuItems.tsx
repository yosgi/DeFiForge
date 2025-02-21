import {
  IconAperture,
  IconCoins,
  IconUserCircle,
  IconChartBar,
  IconFileText,
  IconUsers,
  IconCreditCard,
  IconUserPlus,
  IconChartDots,
  IconLogin,
  IconHome,
  IconCash,
  IconUsersGroup,
} from "@tabler/icons-react";
import { id } from "ethers";

import { uniqueId } from "lodash";
import { title } from "process";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },
  {
    id: uniqueId(),
    title: "我的邀请",
    icon: IconUsersGroup,  // 团队、邀请相关
    href: "/",
  },
  {
    id: uniqueId(),
    title: "合伙申请",
    icon: IconUserCircle,  // 合作伙伴或用户申请
    href: "/applications",
  },
  {
    id: uniqueId(),
    title: "每日赚钱",
    icon: IconCash,  // 每日收益或赚钱相关
    href: "/adminSubmissions",
  },
 
  {
    navlabel: true,
    subheader: "Utilities",
  },
  {
    id:uniqueId(),
    title: "团队管理",
    icon: IconUsersGroup,  // 团队、邀请相关
    href: "/teams",
  },
 
  // {
  //   id: uniqueId(),
  //   title: "数据统计",
  //   icon: IconChartBar,  // 数据统计相关
  //   href: "/static",
  // },

  {
    id: uniqueId(),
    title: "数据图表",
    icon: IconChartDots,  // 图表和数据可视化
    href: "/dashboard",
  },
  {
    id: uniqueId(),
    title: "人员管理",
    icon: IconUsers,  // 人员管理相关
    href: "/admins",
  }, 
 
  {
    id: uniqueId(),
    title: "邀请管理",
    icon: IconUsersGroup,  // 团队、邀请相关
    href: "/referrals",
  },
  {
    id: uniqueId(),
    title: "用户管理",
    icon: IconUserCircle,  // 用户管理相关
    href: "/users",
  },
  {
    id: uniqueId(),
    title: "流通管理",
    icon: IconCreditCard,  // 与支付或付款相关
    href: "/investments",
  },
  {
    id: uniqueId(),
    title: "新币管理",
    icon: IconCoins,  // 与新币相关
    href: "/dao",
  },
  {
    id:uniqueId(),
    title:"储蓄管理",
    icon:IconCash,
    href:"/savingsPage"
  },
  {
    id: uniqueId(),
    title: "借贷管理",
    icon: IconFileText, 
    href: "/brrow"
  },

  {
    navlabel: true,
    subheader: "Auth",
  },
  {
    id: uniqueId(),
    title: "登录",
    icon: IconLogin,  // 登录
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "注册",
    icon: IconUserPlus,  // 用户注册
    href: "/authentication/register",
  },
];

export default Menuitems;