#include "stm32f10x.h"                  // Device header
#include "Delay.h"
#include "OLED.h"
#include "usart.h"
#include "dht11.h"
#include "AD.h"
#include "LED.h"
#include "Key.h"
#include "beep.h"
#include "esp8266.h"
#include "onenet.h"

#include <stdio.h>

u8 temp;
u8 humi;
u8 Led_state = 0;
char temp_chr[10];
char humi_chr[10];
uint16_t ADValue;			//定义AD值变量
uint8_t KeyNum;
double percentage;
char illumination[10];
const char *devSubtopics[] = {"ddq_sub"};
const char devPubtopics[] = "ddq_pub";
char pub_buf[256];

void Hardware_Init(void)
{
	/*模块初始化*/
	OLED_Init();		//OLED初始化
	AD_Init();			//AD初始化
	LED_Init();			//LED初始化
	Key_Init();			//按键初始化
	Beep_Init();		//蜂鸣器初始化
	Usart1_Init(115200);     //Debug串口初始化
	Usart2_Init(115200);	 //8266串口初始化
	
	UsartPrintf(USART_DEBUG, " Hardware init OK\r\n");	
}

void OLEDshow_Init()
{
	/*显示静态字符串*/
	OLED_ShowString(1, 1, "Environmental");
	OLED_ShowString(2, 1, "Temp:");
	OLED_ShowString(3, 1, "Humi:");
	OLED_ShowString(4, 1, "Light:");
	OLED_ShowString(2,8,"C");
	OLED_ShowChar(3,8,'%');
	OLED_ShowString(3,9,"RH");
	OLED_ShowChar(4,12,'%');
	OLED_ShowString(4,13,"Lx");
}


int main(void)
{
	
	Hardware_Init();		//外设初始化
	OLEDshow_Init();		//OLED静态字符串显示
	ESP8266_Init();			//初始化8266
	while(OneNet_DevLink())			//接入OneNET
		Delay_ms(500);
	
	Beep_ON();				//鸣叫提示接入成功
	Delay_ms(250);
	Beep_OFF();
	OneNet_Subscribe(devSubtopics, 1);
	
	unsigned short timeCount = 0;	//发送间隔变量
	unsigned char *dataPtr = NULL;
	
	
	
	
	while (1)
	{	
		
		if (timeCount % 40 == 0)
		{
			// DHT11模块
			DHT11_Read_Data(&temp,&humi);
			sprintf(temp_chr,"%d", temp);
			sprintf(humi_chr,"%d", humi);
			OLED_ShowString(2,6,temp_chr);
			OLED_ShowString(3,6,humi_chr);
			
			
			// 光敏电阻传感器转换AD值为光照强度
			ADValue = AD_GetValue();					//获取AD转换的值
			percentage = (1 - (double)ADValue / 4096) * 100;
			// 确保百分比在0到100之间
			if (percentage < 0) {
				percentage = 0;
			} else if (percentage > 100) {
				percentage = 100;
			}
			sprintf(illumination,"%.2f",percentage);
			OLED_ShowString(4, 7, illumination);				//显示转换百分比后AD值
		}
		
		// 按键控制PC13LED灯 && 蜂鸣器
		KeyNum = Key_GetNum();
		if (KeyNum == 1)
		{
			LED1_Turn();
			Beep_Turn();
		}
		
		if(++timeCount >= 40)									//发送间隔1s
		{
			UsartPrintf(USART_DEBUG, "OneNet_Publish\r\n");
			Led_state = GPIO_ReadOutputDataBit(GPIOC, GPIO_Pin_13);
			
			sprintf(pub_buf, "{\"Temp\":\"%s\",\"Humi\":\"%s\",\"Light\":\"%s\",\"Led_state\":%d}", temp_chr, humi_chr, illumination, Led_state?0:1);
			
			OneNet_Publish(devPubtopics, pub_buf);
			
			timeCount = 0;
			ESP8266_Clear();
		}
		
		dataPtr = ESP8266_GetIPD(3);
		if(dataPtr != NULL)
			OneNet_RevPro(dataPtr);
		
		
		Delay_ms(10);			//延时
	}
}
