<template>
	<view class="dashboard">
		<view class="card">
			<view class="card-content">
				<view class="status-item">
					<view class="status-icon">🌡️</view>
					<view class="status-info">
						<view class="status-value">{{ temperature }}°C</view>
						<view class="status-value">温度</view>
					</view>
				</view>
				<view class="status-item">
					<view class="status-icon">💧</view>
					<view class="status-info">
						<view class="status-value">{{ humidity }}%</view>
						<view class="status-value">湿度</view>
					</view>
				</view>
				<view class="status-item">
					<view class="status-icon">💡</view>
					<view class="status-info">
						<view class="status-value">{{ luminance }}%Lx</view>
						<view class="status-value">光照度</view>
					</view>
				</view>
				<view class="status-item">
					<view class="status-icon">☀️</view>
					<view class="status-info">
						<view class="status-value">灯光</view>
						<switch :checked="led" @change="Led_sitch()" />
					</view>	
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		mounted() {
			/* 连接MQTT服务器 */
			this.startConnect();
			
			/* 监听消息 */
			this.$mqttTool.onMessage(this.handleMqttMessage);
			
			/* 订阅主题 */
			this.sub_topic();
		},
		data() {
			return {
				/* UI变量  */
				temperature: 0,		// 温度
				humidity: 0,		// 湿度
				luminance: 0.0,		// 光照强度
				led: false,			// 开关状态

				/* MQTT */
				connectInfo: {
					clientId: 'dq_phone',	// 客户端标识
					username: '11',			// 用户名
					password: '123',		// 密码
					clean: true				// 是否清除会话
				},
				subscribeInfo: {
					topic: 'ddq_pub',		// 发送消息订阅主题
					qos: 0,					//QOS : 0
				},
				publishInfo: {
					topic: 'ddq_sub',		//接收消息订阅主题
					message: ''
				},
				Led_state: {
					topic: 'ddq_sub',
					message: '{"LED_SW":0}'	// LED状态
				},
				isBuffer: false
			};
		},
		methods: {
			/* 连接 */
			async startConnect() {
				var _this = this
				if (this.client && this.client.connected) {
					console.log('客户端已连接');
					return;
				}
				let opts = {
					url: 'ws://dqwork.zitiu.top:8083/mqtt',
					clientId: this.connectInfo.clientId,
					username: this.connectInfo.username,
					password: this.connectInfo.password,
					clean: this.connectInfo.clean
				}
				var client = await this.$mqttTool.connect(opts);
				client.on('connect', function(res) {
					_this.logs.unshift({
						option: 'mqtt：',
						log: '连接成功'
					})
				})
				client.on('reconnect', function(res) {
					_this.logs.unshift({
						option: 'mqtt：',
						log: '重新连接'
					})
				})
				client.on('error', function(res) {
					_this.logs.unshift({
						option: 'mqtt：',
						log: '连接错误'
					})
				})
				client.on('close', function(res) {
					_this.logs.unshift({
						option: 'mqtt：',
						log: '关闭成功'
					})
				})
			},
			/* 终止连接 */
			endConnect() {
				var _this = this
				this.$mqttTool.end().then(res => {
					_this.logs.unshift({
						option: '终止：',
						log: res
					})
				})
			},
			/* 重新连接 */
			reConnect() {
				var _this = this
				this.$mqttTool.reconnect().then(res => {
					_this.logs.unshift({
						option: '重连：',
						log: res
					})
				})
			},
			/* 发送消息 */
			publish() {
				var _this = this
				let opts = {
					topic: this.publishInfo.topic,
					message: this.publishInfo.message,
				}
				this.$mqttTool.publish(opts).then(res => {
					_this.logs.unshift({
						option: '发送：',
						log: res
					})
				})
			},
			/* 开关灯 */
			Led_sitch() {
				var _this = this
				var parsedData = JSON.parse(this.Led_state.message);
				var variableValue = parsedData.LED_SW === 1 ? 0 : 1;
				var jsonString = `{"LED_SW":${variableValue}}`;
				this.Led_state.message = jsonString;
				let opts = {
					topic: this.Led_state.topic,
					message: this.Led_state.message
				}
				this.$mqttTool.publish(opts).then(res => {
					_this.logs.unshift({
						option: '发送：',
						log: res
					})
					this.led = variableValue === 1 ? false : true;
				})
			},
			/* 订阅ddq_pub */
			sub_topic() {
				var _this = this
				let opts = {
					topic: 'ddq_pub',
					qos: 0,
				}
				this.$mqttTool.subscribe(opts).then(res =>{
					_this.logs.unshift({option:'订阅' + opts.topic + '：', log:res})
				})
				
			},
			
			/* 消息监听 */
			handleMqttMessage(topic, message) {
			      console.log(`Received message: ${message} on topic: ${topic}`);
			      // 根据消息内容更新组件的数据
			      const data = JSON.parse(message);
			      this.temperature = data.Temp;
			      this.humidity = data.Humi;
			      this.luminance = data.Light;
				  this.led = data.Led_state === 1;
			    },
		},

	};
</script>

<style scoped>
	.dashboard {
		padding: 20px;
		font-family: 'Arial', sans-serif;
	}

	.card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.card-header {
		background-color: #007bff;
		color: white;
		padding: 20px;
		position: relative;
	}

	.days {
		position: absolute;
		top: 20px;
		right: 20px;
		font-size: 24px;
		font-weight: bold;
	}

	.description {
		font-size: 14px;
		opacity: 0.9;
	}

	.card-content {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 15px;
		padding: 20px;
	}

	.status-item {
		display: flex;
		align-items: center;
		background: #f7f7f7;
		border-radius: 8px;
		padding: 10px;
	}

	.status-icon {
		font-size: 24px;
		margin-right: 10px;
	}

	.status-info {
		display: flex;
		flex-direction: column;
	}

	.status-value {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.status-label {
		font-size: 14px;
		color: #666;
	}

	.toggle-switch {
		margin-left: auto;
		position: relative;
	}

	.toggle-switch input[type="checkbox"] {
		opacity: 0;
		width: 40px;
		height: 20px;
		position: absolute;
	}

	.toggle-switch label {
		background: #ccc;
		cursor: pointer;
		width: 40px;
		height: 20px;
		border-radius: 20px;
		position: absolute;
		transition: background 0.2s;
	}

	.toggle-switch input[type="checkbox"]:checked+label {
		background: #007bff;
	}

	.toggle-switch label:after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s;
	}

	.toggle-switch input[type="checkbox"]:checked+label:after {
		transform: translateX(20px);
	}
	
	.tips-panel{
		width: 100%;
		margin: 0 auto;
		height: calc(100vh - 430upx);
		font-size: 13px;
		color: #3e3d3e;
		word-break: break-all;
		.panel-list{
			padding: 10upx 20upx;
			border-bottom: 1px solid #eeeeee;
		}
	}
</style>