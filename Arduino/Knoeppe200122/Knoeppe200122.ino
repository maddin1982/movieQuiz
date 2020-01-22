/*
 * CIRCUIT:
 * 
 * VCC---|1KOhm|---PB0---|SW00|---GND
 * 
 * VCC---|1KOhm|---PD7---|SW2C|---GND
 * VCC---|1KOhm|---PD6---|SW2B|---GND
 * VCC---|1KOhm|---PD5---|SW2A|---GND
 * VCC---|1KOhm|---PD4---|SW1C|---GND
 * VCC---|1KOhm|---PD3---|SW1B|---GND 
 * VCC---|1KOhm|---PD2---|SW1A|---GND
 * 
 * DO:
 * read 7Keys
 * ignore double keys from player
 * transmit byte
 * freeze and wait for next key
*/
#define WAIT_US 1
#define BLIND_MS_PRESS 1000
#define BLIND_MS_RELEASE 40
void setup()
{
  //Pullups if no external Pullups(1k) exists:
  PORTB |= 0b00000001;
  PORTD |= 0b11111100;
  //set PORTB1 Output+LOW as FAKEGND
  DDRB  |= 0b00000010;
  //Serial:
  Serial.begin(9600);
  while (!Serial);
  //Serial.println("Hello"); 
}

//global:
byte oldValue=0;

void loop()
{   
  //get keys
  byte value= ~(((PIND & 0b11111100)>>1)+(PINB & 0b00000001));
  //only new keystates are valide
  if(value!=oldValue)
  {
    byte keys= ((value & (1<<6))>>6)+((value & (1<<5))>>5)+((value & (1<<4))>>4)+((value & (1<<3))>>3)+((value & (1<<2))>>2)+((value & (1<<1))>>1)+(value & 1);
    byte payl= ((value & (1<<6))>>6)*7 +((value & (1<<5))>>5)*6 +((value & (1<<4))>>4)*5 +((value & (1<<3))>>3)*4 +((value & (1<<2))>>2)*3+((value & (1<<1))>>1)*2+(value & 1); 
    //no doublekeys
    if(keys==1)
    {
      digitalWrite(13, 1);
      Serial.print(payl-1); //Martin is the King (we print 0...6)
      delay(BLIND_MS_PRESS);
      digitalWrite(13, 0);    
    }
    oldValue=value;
    delay(BLIND_MS_RELEASE);
  }  
  delayMicroseconds(WAIT_US);
}
