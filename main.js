auto.waitFor();

let currentTime = new Date(); //当前时间不戳

//读取配置文件
let file = files.read("./config.json");
let config = JSON.parse(file);

let sbHour = config.sbHour;
let sbMinute = config.sbMinute;
let sbSecond = config.sbSecond;
let xbHour = config.xbHour;
let xbMinute = config.xbMinute;
let xbSecond = config.xbSecond;
let menu = config.workTitle;
let sbEarly = config.sbEarly;
let xbDelay = config.xbDelay;
let txApiKey = config.txApiKey;
let pushoverApiKey = config.pushoverApiKey;
let dingPassword = config.dingPassword;

minNum = config.randomMin;
maxNum = config.randomMax;

let sbTime = sbHour * 3600 + sbMinute * 60 + sbSecond * 60;
let xbTime = xbHour * 3600 + xbMinute * 3600 + xbSecond * 3600;
let thisTime =
  currentTime.getHours() * 60 * 60 +
  currentTime.getMinutes() * 60 +
  currentTime.getSeconds();

// 1上班 2下班 0不打
let bc = 0;

let $$init = {
  start() {
    return wakeUp();

    function fullChain() {
      openDingtalk();

      loginDingtalk();

      if (fastSign()) {
        return true;
      }
      inKaoqin();
      signIn();
    }

    function wakeUp() {
      while (!device.isScreenOn()) {
        toastLog("努力点亮手机");

        device.wakeUpIfNeeded();

        sleep(1000);

        swipe(500, 2000, 500, 1000, 220);
      }

      //注册退出事件
      events.on("exit", function () {
        home();
      });

      detectTimer();
    }

    function detectTimer() {
      if (thisTime < sbTime) {
        //上班时间一小时以内
        bc = 1;
        console.log("打上班卡");
        fullChain();
      } else if (thisTime > xbTime) {
        //下班时间5分钟以上
        bc = 2;
        console.log("打下班卡");
        fullChain();
      } else {
        //不用打卡直接设置时间
        bc = 0;
        console.log("不用打卡");
      }

      setTimer();

      return;
    }

    function setTimer() {
      let timee = "";
      let str = "";
      if (thisTime < sbTime) {
        //打当天上班卡时间设置
        let date = getAvailableDate(new Date() - 86400 * 1000);
        str = date + " " + sbHour + ":" + sbMinute + ":" + sbSecond;
        timee = Date.parse(str) - sbEarly * 1000 + randomNum() * 60 * 1000;
      }
      if (thisTime < xbTime) {
        //打当天下班卡时间设置
        let date = getAvailableDate(new Date() - 86400 * 1000);
        str = date + " " + xbHour + ":" + xbMinute + ":" + xbSecond;
        timee = Date.parse(str) + xbDelay * 1000 + randomNum() * 60 * 1000;
      }
      if (thisTime > xbTime) {
        //打下一次上班卡时间设置
        let date = getAvailableDate(new Date() - 0);
        str = date + " " + sbHour + ":" + sbMinute + ":" + sbSecond;
        timee = Date.parse(str) - sbEarly * 1000 + randomNum() * 60 * 1000;
      }
      let timer = require("./modules/ext-timers.js")(runtime, this);
      let task = timer.addDisposableTask({
        path: "main.js",
        date: timee,
      });
      postMessage(
        "打卡完毕，已设置打卡定时：" +
          dateFormat("Y-mm-dd HH:MM:SS", new Date(timee)) +
          " 定时提醒"
      );
    }

    function randomNum() {
      return random(minNum, maxNum);
    }

    function getAvailableDate(cTime) {
      let d = new Date(cTime + 86400 * 1000);

      let ish = isHoliday(dateFormat("Y-mm-dd", d));
      if (ish) {
        //如果当天是假日，则明天
        return getAvailableDate(cTime + 86400 * 1000);
      }
      return dateFormat("Y/mm/dd", new Date(cTime + 86400 * 1000));
    }

    function openDingtalk() {
      if (currentPackage() == "com.alibaba.android.rimet") {
        toastLog("当前在钉钉里");
        return;
      }
      toastLog("启动钉钉APPing");
      let res = app.launchApp("钉钉");
      if (!res) {
        postMessage("没有找到可以打开的钉钉");
      }
    }

    function loginDingtalk() {
      if (textContains("我的") && textContains("消息")) {
        toastLog("钉钉已登录，跳过此环节");
        return true;
      }
      toastLog("尝试登录钉钉");
      let passwordInput = id("et_pwd_login").findOne(5000);
      if (passwordInput) {
        toastLog("找到密码输入框");
        let res = passwordInput.setText(dingPassword);
        if (!res) {
          toastLog("输入失败");
        }
        let btn = id("btn_next").findOne(4000);
        btn.click();
        sleep(5000);
      } else {
        toastLog("寻找密码输入按钮");
        let passwordLogin = textContains("密码登录").findOne(5000);
        if (!passwordLogin) {
          return false;
        }
        passwordLogin.click();
        loginDingtalk();
      }
      return false;
    }

    function fastSign() {
      toastLog("等待10秒的极速打卡");
      //等待10秒的极速打卡
      let tt = textContains("查看打卡结果").findOnce(3000);
      if (tt) {
        postMessage("极速打卡成功，哦耶");
        return true;
      }
      toastLog("未检测到极速打卡通知，开始正常打卡");
      return false;
    }

    //进入考勤页面
    function inKaoqin() {
      //这10秒包括了启动钉钉所需的时间
      workBtn = text(menu).findOne(10000);
      if (!workBtn) {
        //可能不在主界面，重启钉钉
        toastLog("钉钉不在主界面可能，重启钉钉");
        shutdownDingtalk();

        openDingtalk();

        workBtn = text(menu).findOne(10000);
      }
      workBtn.parent().parent().click();
      toastLog("进入工作台");
      dkBtn = text("考勤打卡").findOne(10000);
      if (!dkBtn) {
        postMessage("打开了控制台却没有找到考勤打卡按钮");
      }
      dkBtn.click();
      toastLog("进入打卡页");
      sleep(3000);
    }

    //点击打卡
    function signIn() {
      if (bc !== 0) {
        textContains("上班").waitFor();
        if (text("外勤打卡").exists() || text("迟到打卡").exists()) {
          postMessage(
            "当前处于外勤打卡或迟到打卡状态，已停止任务，请自己处理。"
          );
          return;
        } else if (bc === 2 && text("更新打卡").exists()) {
          postMessage("已经打过卡了，再见");
          return;
        } else if (bc == 1 && textContains("已打卡").exists()) {
          postMessage("已经打过卡了，再见");
          return;
        }
        let text1 = "";
        if (bc == 1) {
          text1 = "上班打卡";
        } else if (bc == 2) {
          text1 = "下班打卡";
        } else {
          postMessage("多余任务，无需打卡");
          return;
        }
        toastLog("当前类型是" + bc + ",点击按钮" + text1);
        dcard = text(text1).findOne(10000);
        if (!dcard) {
          postMessage("没有找到打卡相关按钮，可能是时间设置出错了吧。");
          return;
        }
        result = dcard.click();
        if (result) {
          postMessage(true);
        } else {
          postMessage(false);
        }
      } else {
        postMessage("未检测到能打的班次，取消打卡");
      }
    }

    function postMessage(result, title) {
      let messge;

      if (typeof result === "boolean") {
        if (result) {
          //打卡成功，推送
          message = "检测到打卡成功消息，打卡成功";
        } else {
          message = "未检测到打卡成功消息或打卡失败";
        }
      } else {
        message = result;
      }

      if (!title) {
        title = "打卡结果";
      }

      toastLog(message);

      if (pushoverApiKey) {
        http.post("https://api.pushover.net/1/messages.json", {
          token: "ahwjzcaceimvz21qrexihcs9qn2dz7",
          user: pushoverApiKey,
          title: title,
          message: message,
        });
      }
    }

    function isHoliday(dater) {
      //返回今天是不是节假日
      if (!txApiKey) {
        return false;
      }

      url =
        "http://api.tianapi.com/txapi/jiejiari/index?key=" +
        txApiKey +
        "&date=" +
        dater;
      let res = http.get(url, {});

      let data = res.body.json()["newslist"][0];

      let ish = data["isnotwork"];
      return !!ish;
    }

    function dateFormat(fmt, date) {
      let ret;
      const opt = {
        "Y+": date.getFullYear().toString(), // 年
        "m+": (date.getMonth() + 1).toString(), // 月
        "d+": date.getDate().toString(), // 日
        "H+": date.getHours().toString(), // 时
        "M+": date.getMinutes().toString(), // 分
        "S+": date.getSeconds().toString(), // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
      };
      for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
          fmt = fmt.replace(
            ret[1],
            ret[1].length == 1 ? opt[k] : padStart(opt[k], ret[1].length, "0")
          );
        }
      }
      return fmt;
    }

    function padStart(string, targetLength, padString) {
      while (string.length < targetLength) {
        string = padString + string;
      }
      return string;
    }

    function shutdownDingtalk() {
      let packageName = app.getPackageName("钉钉");
      app.openAppSetting(packageName);
      text("钉钉").waitFor();
      let is_sure = textContains("结束").findOne();

      if (is_sure.enabled()) {
        click("结束");
        textContains("确定").findOne();
        click("确定");
        log(app.getAppName(packageName) + "应用已被关闭");
        sleep(1000);
      } else {
        log(app.getAppName(packageName) + "应用不能被正常关闭或不在后台运行");
      }
    }
  },

  bind() {
    return this;
  },
}.bind();

$$init.start();
