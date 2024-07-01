/* main.js 项目主入口注入实例 */
// import mqttTool from './lib/mqttTool.js'
// Vue.prototype.$mqttTool = mqttTool

/* 使用范例见 /pages/index/index.vue */
// mqtt协议：H5使用ws/wss APP-PLUS使用wx/wxs

var mqtt = require('mqtt/dist/mqtt.js')

let mqttTool = {
	client: null
}

/*
 * 函数名: mqttTool.connect
 * 功能: 通过 MQTT 连接到代理
 * 参数:
 *   - params: 包含连接参数的对象
 *     - clientId: 客户端标识符
 *     - username: 用户名
 *     - password: 密码
 *     - clean: 是否清除会话状态
 *     - url: MQTT 代理的 URL
 * 返回值: 返回连接到 MQTT 代理的客户端对象
 */
mqttTool.connect = function(params) {
    // 设置连接参数
    let options = {
        clientId: params.clientId,         // 客户端标识符
        username: params.username,         // 用户名
        password: params.password,         // 密码
        clean: params.clean,               // 是否清除会话状态
        connectTimeout: 10000,             // 连接超时时间
        cleanSession: false,               // 清除会话状态
        keepalive: 30                      // 保持连接的时间间隔
    };

    // 创建 MQTT 客户端对象并连接到代理
    let client = mqtt.connect(params.url, options);

    // 将连接好的客户端对象保存到mqttTool对象中
    mqttTool.client = client;

    // 返回连接到 MQTT 代理的客户端对象
    return client;
};

mqttTool.end = function(){
	return new Promise((resolve, reject) => {
		if(mqttTool.client == null){
			resolve('未连接')
			console.log('App_text' + ":end 未连接")
			return;
		}
		mqttTool.client.end()
		mqttTool.client = null
		resolve('连接终止')
	})
}

mqttTool.reconnect = function(){
	return new Promise((resolve, reject) => {
		if(mqttTool.client == null){
			resolve('未连接')
			console.log('App_text' + ":reconnect 未连接")
			return;
		}
		mqttTool.client.reconnect()
	})
}

/*
 * 函数名: mqttTool.subscribe
 * 功能: 订阅指定主题的消息
 * 参数:
 *   - params: 包含订阅参数的对象
 *     - topic: 要订阅的主题
 *     - qos: 消息质量服务等级
 * 返回值: 返回一个 Promise 对象，用于异步处理订阅结果
 */
mqttTool.subscribe = function(params) {
    return new Promise((resolve, reject) => {
        // 检查是否已连接到 MQTT 代理
        if (mqttTool.client == null) {
            resolve('未连接'); // 返回未连接的状态
            console.log('App_text' + ":unconnect 未连接");
            return;
        }

        // 使用 MQTT 客户端对象订阅指定主题
        mqttTool.client.subscribe(params.topic, { qos: params.qos }, function(err, res) {
            console.log(err, res);
            // 检查订阅结果，如果成功则解析为"订阅成功"，否则解析为"订阅失败"
            if (!err && res.length > 0) {
                resolve('订阅成功');
                console.log('App_text' + ":subscribe success 订阅成功");
            } else {
                resolve('订阅失败');
                console.log('App_text' + ":subscribe failed 订阅失败");
                return;
            }
        });
    });
};

mqttTool.unsubscribe = function(params){
	return new Promise((resolve, reject) => {
		if(mqttTool.client == null){
			resolve('未连接')
			console.log('App_text' + ":unconnect 未连接")
			return;
		}
		mqttTool.client.unsubscribe(params.topic, function(err) {
			if (!err) {
				resolve('取消订阅成功')
				console.log('App_text' + ":unsubscribe success 取消订阅成功")
			}else{
				resolve('取消订阅失败')
				console.log('App_text' + ":unsubscribe failed 取消订阅失败")
				return;
			} 
		})  
	})
}

/*
 * 函数名: mqttTool.publish
 * 功能: 发布消息到指定主题
 * 参数:
 *   - params: 包含发布参数的对象
 *     - topic: 指定发布的主题
 *     - message: 要发布的消息内容
 * 返回值: 返回一个 Promise 对象，用于异步处理发布结果
 */
mqttTool.publish = function(params) {
    return new Promise((resolve, reject) => {
        // 检查是否已连接到 MQTT 代理
        if (mqttTool.client == null) {
            resolve('未连接'); // 返回未连接的状态
            console.log('App_text' + ":unconnect 未连接");
            return;
        }

        // 使用 MQTT 客户端对象发布消息到指定主题
        mqttTool.client.publish(params.topic, params.message, function(err) {
            // 检查发布结果，如果成功则解析为"主题-消息-发送成功"，否则解析为"主题-消息-发送失败"
            if (!err) {
                resolve(params.topic + '-' + params.message + '-发送成功');
                console.log('App_text' + ":publish success 发送成功");
            } else {
                resolve(params.topic + '-' + params.message + '-发送失败');
                console.log('App_text' + ":publish failed 发送失败");
                return;
            }
        });
    });
};

/*
 * 函数名: mqttTool.onMessage
 * 功能: 设置接收消息的监听器
 * 参数:
 *   - callback: 接收到消息时的回调函数，带有两个参数，分别是消息主题和消息内容
 */
mqttTool.onMessage = function(callback) {
  // 检查是否已连接到 MQTT 代理
  if (mqttTool.client) {
    // 设置接收消息的监听器
    mqttTool.client.on('message', function(topic, message) {
      // 调用回调函数处理接收到的消息，将 Buffer 转换为字符串
      callback(topic, message.toString());
    });
  } else {
    console.log('App_text: 未连接，无法设置消息监听器');
  }
};


export default mqttTool
