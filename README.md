# 基于 Auto.js 的钉钉自动化打卡脚本

## 特性

1. 钉钉远程打卡
2. 自动判断上下班时间及打卡班次
3. 根据上下班时间提前及延后随机时间
4. 自动点亮屏幕
5. 打卡结果通知
6. 智能跳过节假日
7. 自动添加计划任务
8. ......

## 用法

在 `config.json` 中修改参数，参数解释如下：

```json
{
  "sbHour": 9, #上班时间的小时
  "sbMinute": 0, #上班时间的分钟
  "sbSecond": 0, #上班时间的秒数
  "sbEarly": 1200, #提前上班打卡的时间，秒
  "xbHour": 18, #下班时间的小时
  "xbMinute": 0, #下班时间的分钟
  "xbSecond": 0, #下班时间的秒数
  "xbDelay": 1800, #延后下班打卡的时间，秒
  "workTitle": "工作台", #钉钉主界面中间按钮的文字，一般为“工作台”
  "randomMin": -9, #在设定时间上的随机偏移时差最小值
  "randomMax": 9, #在设定时间上的随机偏移时差最大值
  "txApiKey": "", #天行API接口，自己申请，用于查节假日，如果不传则默认每天都是工作日
  "pushoverApiKey": "" #pushOver，用于推送打卡结果，不填则不推
}
```

手机不要有密码

目前点亮屏幕最佳小米手机

毕竟其他手机没做过实验

不保证兼容性

## 捐赠

既然这个项目可以省掉你上班那么着急打卡的时间，不如来让作者打个车上班吧呜呜呜

要是想让我接着坐地铁的话，就点个星星吧

![WechatIMG85](https://user-images.githubusercontent.com/9566402/110096812-4beb0200-7dd9-11eb-9ccc-a0e5ad49cbeb.jpeg)

![WechatIMG86](https://user-images.githubusercontent.com/9566402/110096820-4d1c2f00-7dd9-11eb-8c52-5fc93e5f528a.jpeg)

## 开源协议 && 贡献

想优化直接提 PR

MIT License

用的时候声明下就好
