// (Heavily) adapted from https://github.com/G6EJD/ESP32-8266-Audio-Spectrum-Display/blob/master/ESP32_Spectrum_Display_02.ino
// Adjusted to allow brightness changes on press+hold, Auto-cycle for 3 button presses within 2 seconds
// Edited to add Neomatrix support for easier compatibility with different layouts.

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <Preferences.h>

Preferences preferences;

#include <FastLED_NeoMatrix.h>
#include <arduinoFFT.h>
#include <EasyButton.h>

#include "timerMinim.h"
#include "fonts.h"

#define IS_HAT 0         // специальные конфиги для кепки

#define SAMPLES         512          // Must be a power of 2
#define SAMPLING_FREQ   40000         // Hz, must be 40000 or less due to ADC conversion time. Determines maximum frequency that can be analysed by the FFT Fmax=sampleF/2.
#define DEF_AMPLITUDE   60          // Depending on your audio source level, you may need to alter this value. Can be used as a 'sensitivity' control.

#if (IS_HAT) 
  #define AUDIO_IN_PIN    15            
  #define LED_PIN         13            
  #define BTN_PIN         4             
#endif
#if (IS_HAT == 0) 
  #define AUDIO_IN_PIN    12            
  #define LED_PIN         13            
  #define BTN_PIN         17            
#endif

#define LONG_PRESS_MS   500           // Number of ms to count as a long press
#define COLOR_ORDER     GRB           // If colours look wrong, play with this
#define CHIPSET         WS2812B       // LED strip type
#define MAX_MILLIAMPS   1000          // Careful with the amount of power here if running off USB port
const int BRIGHTNESS_SETTINGS[3] = {5, 7, 10};  // 3 Integer array for 3 brightness settings (based on pressing+holding BTN_PIN)
#define LED_VOLTS       5             // Usually 5 or 12


#if (IS_HAT) 
  #define EQULIZER_OFFSET 0             
#endif
#if (IS_HAT == 0) 
  #define EQULIZER_OFFSET 0             
#endif

#define NOISE           200   // Used as a crude noise filter, values below this are ignored

#if (IS_HAT == 1) 
  const uint8_t kMatrixWidth = 23;                          // Matrix width
  const uint8_t kMatrixHeight = 8;                          // Matrix height         
#endif
#if (IS_HAT == 0) 
  const uint8_t kMatrixWidth = 16;                          // Matrix width
  const uint8_t kMatrixHeight = 16; 
#endif

#define NUM_LEDS       (kMatrixWidth * kMatrixHeight)     // Total number of LEDs
#define TOP            (kMatrixHeight - 0)                // Don't allow the bars to go offscreen
#define SERPENTINE     true                               // Set to false if you're LEDS are connected end to end, true if serpentine

// Sampling and FFT stuff
unsigned int sampling_period_us;
byte peak[] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};              // The length of these arrays must be >= NUM_BANDS
int oldBarHeights[] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
int bandValues[] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};

int amplitude = DEF_AMPLITUDE;

// Button stuff
int buttonPushCounter = 0;
bool autoChangePatterns = false;
EasyButton modeBtn(BTN_PIN);

// FastLED stuff
CRGB leds[NUM_LEDS];
DEFINE_GRADIENT_PALETTE( purple_gp ) {
  0,   0, 212, 255,   //blue
255, 179,   0, 255 }; //purple
DEFINE_GRADIENT_PALETTE( outrun_gp ) {
  0, 141,   0, 100,   //purple
127, 255, 192,   0,   //yellow
255,   0,   5, 255 };  //blue
DEFINE_GRADIENT_PALETTE( greenblue_gp ) {
  0,   0, 255,  60,   //green
 64,   0, 236, 255,   //cyan
128,   0,   5, 255,   //blue
192,   0, 236, 255,   //cyan
255,   0, 255,  60 }; //green
DEFINE_GRADIENT_PALETTE( redyellow_gp ) {
0,     255,   0,    0,   //red
64,    255, 255,    0,   //bright yellow
128,     0, 255,    0,   //red
192,   255, 218,    0,   //yellow
255,   200, 200,  200 }; //white
CRGBPalette16 purplePal = purple_gp;
CRGBPalette16 outrunPal = outrun_gp;
CRGBPalette16 greenbluePal = greenblue_gp;
CRGBPalette16 heatPal = redyellow_gp;
uint8_t colorTimer = 0;

boolean isConnectMode = false;   
boolean deviceConnected = false;
boolean oldDeviceConnected = false;

boolean fullTextFlag = false;                   // флаг: текст бегущей строки показан полностью (строка убежала)
boolean loadingFlag = true;                     // флаг: выполняется инициализация параметров режима
byte modeCode;                                  // тип текущего эффекта: 0 бегущая строка, 1 эквалайзер
byte thisMode = 1;                              // текущий режим
byte thisEffect = 0;                            // текущий эффект
byte thisNumBands = 8;
int currentNoise = 500;   // Used as a crude noise filter, values below this are ignored
int currentBridgest = BRIGHTNESS_SETTINGS[1];   // текущая яркость
byte breathBrightness;     
uint32_t globalColor = 0xffffff;                // Цвет рисования при запуске белый
String runningText = "";                        // Текущий текст бегущей строки, задаваемый пользователем со смартфона

int barWidth = (kMatrixWidth  / thisNumBands);
int amplitudeFactor = 1;
int currentSamples = 512;           // Must be a power of 2

double vReal[1024];
double vImag[1024];

unsigned long newTime;

arduinoFFT FFT = arduinoFFT(vReal, vImag, SAMPLES, SAMPLING_FREQ);

#define D_TEXT_SPEED 70      // скорость бегущего текста по умолчанию (мс)
#define D_TEXT_SPEED_MIN 30
#define D_TEXT_SPEED_MAX 255

#define D_EFFECT_SPEED 80     // скорость эффектов по умолчанию (мс)
#define D_EFFECT_SPEED_MIN 0
#define D_EFFECT_SPEED_MAX 255

// modes
#define MC_TEXT                  0
#define MC_EQUALIZER             1
#define MC_SNOW                  2
#define MC_BALL                  3
#define MC_BALLS                 4
#define MC_RAINBOW               5
#define MC_RAINBOW_DIAG          6
#define MC_FIRE                  7
#define MC_MATRIX                8
#define MC_STARFALL              9
#define MC_SPARKLES             10

// effects
#define EFFECT_BREATH           1 
#define EFFECT_COLOR            2 
#define EFFECT_RAINBOW_PIX      3 

timerMinim scrollTimer(D_TEXT_SPEED);                   // Таймер прокрутки текста эффекта бегущей строки
int scrollSpeed = D_TEXT_SPEED;                         // скорость прокрутки текста бегущей строки

timerMinim effectTimer(D_EFFECT_SPEED);                 // Таймер скорости эффекта (шага выполнения эффекта)

// FastLED_NeoMaxtrix - see https://github.com/marcmerlin/FastLED_NeoMatrix for Tiled Matrixes, Zig-Zag and so forth
FastLED_NeoMatrix *matrix = new FastLED_NeoMatrix(leds, kMatrixWidth, kMatrixHeight,
  NEO_MATRIX_TOP        + NEO_MATRIX_LEFT +
  NEO_MATRIX_ROWS       + NEO_MATRIX_ZIGZAG +
  NEO_TILE_TOP + NEO_TILE_LEFT + NEO_TILE_ROWS);


// работа с бегущим текстом

// **************** НАСТРОЙКИ ****************
#define MIRR_V 0          // отразить текст по вертикали (0 / 1)
#define MIRR_H 0          // отразить текст по горизонтали (0 / 1)

#define TEXT_HEIGHT 0     // высота, на которой бежит текст (от низа матрицы)
#define LET_WIDTH 5       // ширина буквы шрифта
#define LET_HEIGHT 8      // высота буквы шрифта
#define SPACE 1           // пробел

// --------------------- ДЛЯ РАЗРАБОТЧИКОВ ----------------------

int offset = kMatrixWidth;

void fillString(String text, uint32_t color) {
  if (loadingFlag) {
    offset = kMatrixWidth;   // перемотка в правый край
    loadingFlag = false;    
#if (SMOOTH_CHANGE == 1)
    loadingFlag = modeCode == MC_TEXT && fadeMode < 2 ;
#else
    loadingFlag = false;        
#endif
    modeCode = MC_TEXT;
    fullTextFlag = false;
  }

  if (scrollTimer.isReady()) {
    FastLED.clear();
    byte i = 0, j = 0;
    while (text[i] != '\0') {
      if ((byte)text[i] > 191) {    // работаем с русскими буквами!
        i++;
      } else {
        drawLetter(j, text[i], offset + j * (LET_WIDTH + SPACE), color);
        i++;
        j++;
      }
    }
    fullTextFlag = false;

    offset--;
    if (offset < -j * (LET_WIDTH + SPACE)) {    // строка убежала
      offset = kMatrixWidth + 3;
      fullTextFlag = true;
    }

    FastLED.show();
  }
}

void drawLetter(uint8_t index, uint8_t letter, int16_t offset, uint32_t color) {
  int8_t start_pos = 0, finish_pos = LET_WIDTH;
  int8_t LH = LET_HEIGHT;
  if (LH > kMatrixHeight) LH = kMatrixHeight;
  int8_t offset_y = (kMatrixHeight - LH) / 2;     // по центру матрицы по высоте
  
  CRGB letterColor;
  if (color == 1) letterColor = CHSV(byte(offset * 10), 255, 255);
  else if (color == 2) letterColor = CHSV(byte(index * 30), 255, 255);
  else letterColor = color;

  if (offset < -LET_WIDTH || offset > kMatrixWidth) return;
  if (offset < 0) start_pos = -offset;
  if (offset > (kMatrixWidth - LET_WIDTH)) finish_pos = kMatrixWidth - offset;

  for (byte i = start_pos; i < finish_pos; i++) {
    int thisByte;
    if (MIRR_V) thisByte = getFont((byte)letter, LET_WIDTH - 1 - i);
    else thisByte = getFont((byte)letter, i);

    for (byte j = 0; j < LH; j++) {
      boolean thisBit;

      if (MIRR_H) thisBit = thisByte & (1 << j);
      else thisBit = thisByte & (1 << (LH - 1 - j));

      // рисуем столбец (i - горизонтальная позиция, j - вертикальная)
      if (thisBit) leds[getPixelNumber(offset + i, offset_y + TEXT_HEIGHT + j)] = letterColor;
    }
  }
}

// ------------- СЛУЖЕБНЫЕ ФУНКЦИИ --------------

// интерпретатор кода символа в массиве fontHEX (для Arduino IDE 1.8.* и выше)
uint8_t getFont(uint8_t font, uint8_t row) {
  font = font - '0' + 16;   // перевод код символа из таблицы ASCII в номер согласно нумерации массива
  if (font <= 90) return pgm_read_byte(&(fontHEX[font][row]));     // для английских букв и символов
  else if (font >= 112 && font <= 159) {    // и пизд*ц для русских
    return pgm_read_byte(&(fontHEX[font - 17][row]));
  } else if (font >= 96 && font <= 111) {
    return pgm_read_byte(&(fontHEX[font + 47][row]));
  }
  return 0;
}


BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
uint32_t value = 115;
std::string readedValue;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define BLE_NAME "SmartMatrix"
//#define BLE_NAME "SmartHat"
BLEUUID SERVICE_UUID((uint16_t)0xFFE0); // UART service UUID
BLEUUID CHARACTERISTIC_UUID ((uint16_t)0xFFE1);

//#define SERVICE_UUID        "0000ffe0-0000-1000-8000-00805f9b34fb" //- must match optional services on navigator.bluetooth.requestDevice
//#define CHARACTERISTIC_UUID "0000ffe0-0000-1000-8000-00805f9b34fc"

class MyServerCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();
      bool isCommand = false;
      bool isGetConfig = false;
      bool getBridgest = false;
      bool getAmplitude = false;
      bool getScrollSpeed = false;
      bool getCurrentNoise = false;
      int currentTempBridgestIndex = 0;
      int currentTempAmplitudeIndex = 0;
      int currentTempScrollSpeedIndex = 0;
      int currentTempCurrentNoiseIndex = 0;
      int newBridgest = currentBridgest;
      char tempBridgest[3] =  {};
      char tempCurrentNoise[3] =  {};
      char tempAmplitude[3] =  {};
      char tempScrollSpeed[3] =  {};
      

      if (value.length() > 0) {
        if (value[0] == '^') {
          getBridgest  = true;
          isCommand = true;
        }

        if (value[0] == '&' && value[1] == '!') {
          isGetConfig  = true;
          isCommand = true;
        }

        if (value[0] == '?') {
          if (value[1] == '0') {
             buttonPushCounter = 0;
          }
          if (value[1] == '1') {
             buttonPushCounter = 1;
          }
          if (value[1] == '2') {
             buttonPushCounter = 2;
          }
          if (value[1] == '3') {
             buttonPushCounter = 3;
          }            
          if (value[1] == '4') {
             buttonPushCounter = 4;
          }
          if (value[1] == '5') {
             buttonPushCounter = 5;
          }
          if (value[1] == '6') {
             buttonPushCounter = 6;
          }
          
          isCommand = true;
        }

        if (thisMode == MC_EQUALIZER) {
          if (value[0] == '!') {
            if (value[1] == '0') {
              autoChangePatterns = false;
            }
            if (value[1] == '1') {
              autoChangePatterns = true;
            }
            
            isCommand = true;
          }
          
          if (value[0] == '@') {
            getAmplitude = true;
            isCommand = true;
          }

          if (value[0] == '*') {
            getCurrentNoise = true;
            isCommand = true;
          }

          if (value[0] == 'b' && value[1] == 'B') {
            isCommand = true;
            
            if (value[2] == '1') {
              thisNumBands = 8;
            }
            
            if (value[2] == '2') {
              thisNumBands = 16;
            }

            preferences.putUInt("thisNumBands", thisNumBands);
            barWidth = (kMatrixWidth  / (thisNumBands - 1));
          }
          if (value[0] == 'a' && value[1] == 'F') {
            isCommand = true;
            
            if (value[2] == '1') {
              amplitudeFactor = 1;
            }
            if (value[2] == '2') {
              amplitudeFactor = 10;
            }
            if (value[2] == '3') {
              amplitudeFactor = 100;
            }
           if (value[2] == '4') {
              amplitudeFactor = 1000;
            }

            preferences.putUInt("amplitudeFactor", amplitudeFactor);
          }
          if (value[0] == 's' && value[1] == 'A') {
            isCommand = true;
            
            if (value[2] == '1') {
              currentSamples = 256;
            }
            if (value[2] == '2') {
              currentSamples = 512;
            }
            if (value[2] == '3') {
              currentSamples = 1024;
            }
            preferences.putUInt("currentSamples", currentSamples);
            vReal[currentSamples];
            vImag[currentSamples];
          }
        }

        if (thisMode == MC_TEXT) {
          if (value[0] == '#') {
            getScrollSpeed = true;
            isCommand = true;
          }
        }
        
        if (value[0] == '$') {
          isCommand = true;
          if (value[1] == '0') {
            thisMode = 0;
          }
          if (value[1] == '1') {
            thisMode = 1;
          }
         if (value[1] == '2') {
            thisMode = 2;
          }
          if (value[1] == '3') {
            thisMode = 3;
          }
          if (value[1] == '4') {
            thisMode = 4;
          }
          if (value[1] == '5') {
            thisMode = 5;
          }
          if (value[1] == '6') {
            thisMode = 6;
          }
          if (value[1] == '7') {
            thisMode = 7;
          }
          if (value[1] == '8') {
            thisMode = 8;
          }
          if (value[1] == '9') {
            thisMode = 9;
          }
          if (value[1] == '1' && value[2] == '0') {
            thisMode = 10;
          }
          loadingFlag = true;
          preferences.putUInt("thisMode", thisMode);
        }

        if (value[0] == '`') {
          isCommand = true;
          if (value[1] == '0') {
            thisEffect = 0;
          }
          if (value[1] == '1') {
            thisEffect = 1;
          }
         if (value[1] == '2') {
            thisEffect = 2;
          }
          if (value[1] == '3') {
            thisEffect = 3;
          }
          
          loadingFlag = true;
          preferences.putUInt("thisEffect", thisEffect);
        }

        for (int i = 0; i < value.length(); i++) {

          if (getBridgest && i > 0) {
            if (value[i]) {
              tempBridgest[currentTempBridgestIndex] = value[i];
            }
            currentTempBridgestIndex++;
            
            if (currentTempBridgestIndex > 2) {
              getBridgest = false;
            }
          }

          if (getAmplitude && i > 0) {
            if (value[i]) {
              tempAmplitude[currentTempAmplitudeIndex] = value[i]; 
            }
            currentTempAmplitudeIndex++;
            
            if (currentTempAmplitudeIndex > 2) {
              getAmplitude = false;
            }
          }
          
          if (getScrollSpeed && i > 0) {
            if (value[i]) {
              tempScrollSpeed[currentTempScrollSpeedIndex] = value[i]; 
            }
            currentTempScrollSpeedIndex++;
            
            if (currentTempScrollSpeedIndex > 2) {
              getScrollSpeed = false;
            }
          }

          if (getCurrentNoise && i > 0) {
            if (value[i]) {
              tempCurrentNoise[currentTempCurrentNoiseIndex] = value[i]; 
            }
            currentTempCurrentNoiseIndex++;
            
            if (currentTempCurrentNoiseIndex > 2) {
              getCurrentNoise = false;
            }
          }
        }
        
        if (isGetConfig) {
          pCharacteristic->setValue("^="); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
          String cBString = String(currentBridgest);
          std::string cBSUnit16((char*)&cBString, cBString.length());

          pCharacteristic->setValue(cBSUnit16); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
          if (thisMode == MC_TEXT) {
            pCharacteristic->setValue(";$=0"); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 
          } else if (thisMode == MC_EQUALIZER) {
            pCharacteristic->setValue(";$=1"); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 


            pCharacteristic->setValue(";*="); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 
            String cnString = String(currentNoise);
            std::string cnStringUnit16((char*)&cnString, cnString.length());
            pCharacteristic->setValue(cnStringUnit16); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 


            pCharacteristic->setValue(";bB="); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 
            String nBString = String(thisNumBands);
            std::string nBStringUnit16((char*)&nBString, nBString.length());
            pCharacteristic->setValue(nBStringUnit16); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 

            pCharacteristic->setValue(";aF="); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 
            String aFString = String(amplitudeFactor);
            std::string aFStringUnit16((char*)&aFString, aFString.length());
            pCharacteristic->setValue(aFStringUnit16); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 

            pCharacteristic->setValue(";sA="); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify(); 
            String csString = String(currentSamples);
            std::string csStringUnit16((char*)&csString, csString.length());
            pCharacteristic->setValue(csStringUnit16); // must add seperator \n for it to register on BLE terminal
            pCharacteristic->notify();             
          }
          pCharacteristic->setValue(";@="); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
          String amplitudeString = String(amplitude);
          std::string amplitudeUnit16((char*)&amplitudeString, amplitudeString.length());
          pCharacteristic->setValue(amplitudeUnit16); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
          pCharacteristic->setValue(";?="); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
          String bPCString = String(buttonPushCounter);
          std::string bPCStringUnit16((char*)&bPCString, bPCString.length());
          pCharacteristic->setValue(bPCStringUnit16); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
          if (autoChangePatterns) {
            pCharacteristic->setValue(";!=1"); // must add seperator \n for it to register on BLE terminal
          } else {
            pCharacteristic->setValue(";!=0"); // must add seperator \n for it to register on BLE terminal
          }
          pCharacteristic->notify(); 
          pCharacteristic->setValue("\n"); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
        } else {
          pCharacteristic->setValue(value +"\n"); // must add seperator \n for it to register on BLE terminal
          pCharacteristic->notify(); 
        }
      }


      int numbBridgest = atoi(tempBridgest);

      if (numbBridgest > 0) {
        preferences.putUInt("currentBridgest", numbBridgest);
        newBridgest = numbBridgest;
        currentBridgest = newBridgest;
      }

      int numbAmplitude = atoi(tempAmplitude);
  
      if (numbAmplitude > 0) {
        amplitude = numbAmplitude;
        preferences.putUInt("amplitude", numbAmplitude);
      }

      int numbCurrentNoise = atoi(tempCurrentNoise);
  
      if (numbCurrentNoise > 0) {
        currentNoise = numbCurrentNoise;
        preferences.putUInt("currentNoise", currentNoise);
      }

      int numbScrollSpeed = atoi(tempScrollSpeed);

      if (numbScrollSpeed > 0) {
        preferences.putUInt("numbScrollSpeed", numbScrollSpeed);
        scrollTimer.setInterval(numbScrollSpeed);
        scrollSpeed = numbScrollSpeed;
      }

      FastLED.setBrightness(newBridgest);
        
      if (thisMode == MC_TEXT && !isCommand) {
        readedValue = value; 
      }
    }
};

//Setup callbacks onConnect and onDisconnect
class MyConnectCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    isConnectMode = false;
  };
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

void setup() {
  Serial.begin(115200);

  preferences.begin("settings", false);

  FastLED.addLeds<CHIPSET, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalSMD5050);
  FastLED.setMaxPowerInVoltsAndMilliamps(LED_VOLTS, MAX_MILLIAMPS);
  FastLED.setBrightness(currentBridgest);
  FastLED.clear();

  currentBridgest = preferences.getUInt("currentBridgest", BRIGHTNESS_SETTINGS[1]); 
  thisMode = preferences.getUInt("thisMode", 1);
  thisEffect = preferences.getUInt("thisEffect", 0);
  scrollSpeed = preferences.getUInt("numbScrollSpeed", D_TEXT_SPEED);

  thisNumBands = preferences.getUInt("thisNumBands", 8);
    Serial.print("thisNumBands:  ");
    Serial.println(thisNumBands);
  currentNoise = preferences.getUInt("currentNoise", NOISE);
    Serial.println("currentNoise:  ");
    Serial.println(currentNoise);
  currentSamples = preferences.getUInt("currentSamples", 512);
    Serial.println("currentSamples:  ");
    Serial.println(currentSamples);
  amplitude = preferences.getUInt("amplitude", DEF_AMPLITUDE);
    Serial.println("amplitude:  ");
    Serial.println(amplitude);
  amplitudeFactor = preferences.getUInt("amplitudeFactor", 1000);
    Serial.println("amplitudeFactor:  ");
    Serial.println(amplitudeFactor);

  barWidth = (kMatrixWidth  / (thisNumBands - 1));


  modeBtn.begin();
//  modeBtn.onPressed(changeMode);
  modeBtn.onPressed(changeEqulizerMode);
  modeBtn.onPressedFor(LONG_PRESS_MS, changeConnectMode);
  modeBtn.onSequence(3, 2000, startAutoMode);
  modeBtn.onSequence(5, 2000, brightnessOff);
  sampling_period_us = round(1000000 * (1.0 / SAMPLING_FREQ));

  BLEDevice::init(BLE_NAME);
  BLEServer *pServer = BLEDevice::createServer();
 
  pServer->setCallbacks(new MyConnectCallbacks());
 
  BLEService *pService = pServer->createService(SERVICE_UUID);

  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  pCharacteristic->setCallbacks(new MyServerCallbacks());
  
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising->start();
}

void changeMode() {
  if (thisMode == 0) {
     thisMode = 1;
  }
  if (thisMode == 1) {
     thisMode = 0;
  }
}

void changeEqulizerMode() {
  Serial.println("Button pressed");
  if (FastLED.getBrightness() == 0) FastLED.setBrightness(BRIGHTNESS_SETTINGS[0]);  //Re-enable if lights are "off"
  autoChangePatterns = false;
  buttonPushCounter = (buttonPushCounter + 1) % 6;
}

void startAutoMode() {
  autoChangePatterns = true;
}

void changeConnectMode() {
  Serial.println("changeConnectMode Button pressed");
  FastLED.clear();
  if (isConnectMode) {
    isConnectMode = false;
  } else {
    isConnectMode = true;
  }
}

void brightnessOff(){
  FastLED.setBrightness(0);  //Lights out
}

void loop() {
  if (!isConnectMode) {
    if (thisMode == MC_TEXT) {
      uint32_t color = globalColor;
  
      switch (buttonPushCounter) {
          case 0:
            color = 1;
            break;
          case 1:
            color = 2;
            break;
          case 2:
            color = CRGB::RoyalBlue;
            break;
          case 3:
            color = CRGB::HotPink;
            break;
          case 4:
            color = CRGB::Lime;
            break;
          case 5:
            color = CRGB::Red;
            break;
  
          default:
            color = globalColor;
      }
      
      if (readedValue.length() > 0) {
        String newValue = readedValue.c_str();
        fillString(newValue, color);
      } else {
        fillString("Продам гараж", color);
      }
    } else if (thisMode == MC_EQUALIZER) {
        // Don't clear screen if heraclitus pattern, be sure to change this is you change the patterns / order
      if (buttonPushCounter != 5) FastLED.clear();
    
      modeBtn.read();
    
      // Reset bandValues[]
      for (int i = 0; i < thisNumBands; i++){
        bandValues[i] = 0;
      }
    
      // Sample the audio pin
      for (int i = 0; i < currentSamples; i++) {
        newTime = micros();
        vReal[i] = analogRead(AUDIO_IN_PIN); // A conversion takes about 9.7uS on an ESP32
        vImag[i] = 0;
        while ((micros() - newTime) < sampling_period_us) { /* chill */ }
      }
    
      // Compute FFT
      FFT.DCRemoval();
      FFT.Windowing(FFT_WIN_TYP_HAMMING, FFT_FORWARD);
      FFT.Compute(FFT_FORWARD);
      FFT.ComplexToMagnitude();

      // Analyse FFT results
      for (int i = 2; i < (currentSamples/2); i++){       // Don't use sample 0 and only first SAMPLES/2 are usable. Each array element represents a frequency bin and its value the amplitude.
        if (vReal[i] > currentNoise) {                    // Add a crude noise filter
  
          if (thisNumBands == 8) {
           // 8 bands, 12kHz top band
            if (i<=3 )           bandValues[0]  += (int)vReal[i];
            if (i>3   && i<=6  ) bandValues[1]  += (int)vReal[i];
            if (i>6   && i<=13 ) bandValues[2]  += (int)vReal[i];
            if (i>13  && i<=27 ) bandValues[3]  += (int)vReal[i];
            if (i>27  && i<=55 ) bandValues[4]  += (int)vReal[i];
            if (i>55  && i<=112) bandValues[5]  += (int)vReal[i];
            if (i>112 && i<=229) bandValues[6]  += (int)vReal[i];
            if (i>229          ) bandValues[7]  += (int)vReal[i];
          } else if (thisNumBands == 16) {
          //16 bands, 12kHz top band
            if (i<=2 )           bandValues[0]  += (int)vReal[i];
            if (i>2   && i<=3  ) bandValues[1]  += (int)vReal[i];
            if (i>3   && i<=5  ) bandValues[2]  += (int)vReal[i];
            if (i>5   && i<=7  ) bandValues[3]  += (int)vReal[i];
            if (i>7   && i<=9  ) bandValues[4]  += (int)vReal[i];
            if (i>9   && i<=13 ) bandValues[5]  += (int)vReal[i];
            if (i>13  && i<=18 ) bandValues[6]  += (int)vReal[i];
            if (i>18  && i<=25 ) bandValues[7]  += (int)vReal[i];
            if (i>25  && i<=36 ) bandValues[8]  += (int)vReal[i];
            if (i>36  && i<=50 ) bandValues[9]  += (int)vReal[i];
            if (i>50  && i<=69 ) bandValues[10] += (int)vReal[i];
            if (i>69  && i<=97 ) bandValues[11] += (int)vReal[i];
            if (i>97  && i<=135) bandValues[12] += (int)vReal[i];
            if (i>135 && i<=189) bandValues[13] += (int)vReal[i];
            if (i>189 && i<=264) bandValues[14] += (int)vReal[i];
            if (i>264          ) bandValues[15] += (int)vReal[i];
          }
        }
      }
      
      // Process the FFT data into bar heights
      for (byte band = 0; band < thisNumBands; band++) {   
        // Scale the bars for the display      
        int barHeight = bandValues[band] / (amplitude * amplitudeFactor);
        if (barHeight > TOP) barHeight = TOP;
    
        // Small amount of averaging between frames
        barHeight = ((oldBarHeights[band] * 1) + barHeight) / 2;
        
        // Move peak up
        if (barHeight > peak[band]) {
          peak[band] = min(TOP, barHeight);
        }
    
        // Draw bars
        switch (buttonPushCounter) {
          case 0:
            rainbowBars(band, barHeight);
            break;
          case 1:
            // No bars on this one
            break;
          case 2:
            purpleBars(band, barHeight);
            break;
          case 3:
            centerBars(band, barHeight);
            break;
          case 4:
            changingBars(band, barHeight);
            break;
          case 5:
            heraclitus(band);
            break;
        }
    
        // Draw peaks
        switch (buttonPushCounter) {
          case 0:
            whitePeak(band);
            break;
          case 1:
            outrunPeak(band);
            break;
          case 2:
            whitePeak(band);
            break;
          case 3:
            // No peaks
            break;
          case 4:
            whitePeak(band);
            break;
          case 5:
            // No peaks
            break;
        }
    
        // Save oldBarHeights for averaging later
        oldBarHeights[band] = barHeight;
      }
    
      // Decay peak
      EVERY_N_MILLISECONDS(120) {
        for (byte band = 0; band < thisNumBands; band++)
          if (peak[band] > 0) peak[band] -= 1;
        colorTimer++;
      }
    
      // Used in some of the patterns
      EVERY_N_MILLISECONDS(5) {
        colorTimer++;
      }
  
      EVERY_N_SECONDS(10) {
        if (autoChangePatterns) buttonPushCounter = (buttonPushCounter + 1) % 6;
      }
    
      FastLED.show();
    } else {   
      if (effectTimer.isReady()) { 
        switch(thisMode) {
          case MC_SNOW:                       snowRoutine(); break;                // снег
          case MC_BALL:                       ballRoutine(); break;                // шарик
          case MC_BALLS:                     ballsRoutine(); break;                // шарики
          case MC_RAINBOW:                 rainbowRoutine(); break;                // радуга
          case MC_RAINBOW_DIAG:    rainbowDiagonalRoutine(); break;                // радуга по диагонали
          case MC_FIRE:                       fireRoutine(); break;                // огонь
          case MC_MATRIX:                   matrixRoutine(); break;                // Матрица
          case MC_STARFALL:               starfallRoutine(); break;                // Цвет
          case MC_SPARKLES:               sparklesRoutine(); break;                // Радуга пикс.
        }
  
        if (thisEffect != 0) { 
          switch (thisEffect) {
            case EFFECT_BREATH:           brightnessRoutine(); break; 
            case EFFECT_COLOR:                colorsRoutine(); break;              
            case EFFECT_RAINBOW_PIX:   rainbowColorsRoutine(); break; 
          }
        }
        
        FastLED.show(); 
       }
    }
  } else {
    fillString("!! Режим подключения !!", globalColor);
  }

  // disconnecting
  if (!deviceConnected && oldDeviceConnected) {
      delay(500); // give the bluetooth stack the chance to get things ready
      pServer->startAdvertising(); // restart advertising
      Serial.println("start advertising");
      oldDeviceConnected = deviceConnected;
      isConnectMode = true;
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected) {
    // do stuff here on connecting
    isConnectMode = false;
    oldDeviceConnected = deviceConnected;
  }
}

// PATTERNS BELOW //

void rainbowBars(int band, int barHeight) {
  int xStart = (barWidth * band) + EQULIZER_OFFSET;
  for (int x = xStart; x < xStart + barWidth; x++) {
    if (barHeight % 2 == 0) barHeight--;
    int yStart = 0;
    for (int y = yStart; y <= (yStart + barHeight); y++) {
      matrix->drawPixel(x, y, CHSV((x / barWidth) * (255 / thisNumBands), 255, 255));
    }
  }
}

void purpleBars(int band, int barHeight) {
  int xStart = (barWidth * band) + EQULIZER_OFFSET;
  for (int x = xStart; x < xStart + barWidth; x++) {
    if (barHeight % 2 == 0) barHeight--;
    int yStart = 0;
    for (int y = yStart; y <= (yStart + barHeight); y++) {
      matrix->drawPixel(x, y, ColorFromPalette(purplePal, y * (255 / (barHeight + 1))));
    }
  }
}

void changingBars(int band, int barHeight) {
  int xStart = (barWidth * band) + EQULIZER_OFFSET;
  for (int x = xStart; x < xStart + barWidth; x++) {
    if (barHeight % 2 == 0) barHeight--;
    int yStart = 0;
    for (int y = yStart; y <= (yStart + barHeight); y++) {
      matrix->drawPixel(x, y, CHSV(y * (255 / kMatrixHeight) + colorTimer, 255, 255));
    }
  }
}

void centerBars(int band, int barHeight) {
  int xStart = (barWidth * band) + EQULIZER_OFFSET;
  for (int x = xStart; x < xStart + barWidth; x++) {
    if (barHeight % 2 == 0) barHeight--;
    int yStart = ((kMatrixHeight - barHeight) / 2 );
    for (int y = yStart; y <= (yStart + barHeight); y++) {
      int colorIndex = constrain((y - yStart) * (255 / barHeight), 0, 255);
      matrix->drawPixel(x, y, ColorFromPalette(heatPal, colorIndex));
    }
  }
}

void whitePeak(int band) {
  int xStart = (barWidth * band) + EQULIZER_OFFSET;
  int peakHeight = peak[band];
  for (int x = xStart; x < xStart + barWidth; x++) {
    matrix->drawPixel(x, peakHeight, CHSV(0,0,255));
  }
}

void outrunPeak(int band) {
  int xStart = (barWidth * band) + EQULIZER_OFFSET;
  int peakHeight = peak[band];
  for (int x = xStart; x < xStart + barWidth; x++) {
    matrix->drawPixel(x, peakHeight, ColorFromPalette(outrunPal, peakHeight * (255 / kMatrixHeight)));
  }
}

void heraclitus(int band) {
  int xStart = (barWidth * band) + EQULIZER_OFFSET;
  double highestBandValue = 30000;        // Set this to calibrate your heraclitus

  // Draw bottom line
  for (int x = xStart; x < xStart + barWidth; x++) {
    matrix->drawPixel(x, 0, CHSV(constrain(map(bandValues[band],0,highestBandValue,160,0),0,160), 255, 255));
  }

  // Move screen up starting at 2nd row from top
  if (band == thisNumBands - 1){
    for (int y = kMatrixHeight - 2; y >= 0; y--) {
      for (int x = 0; x < kMatrixWidth; x++) {
        int pixelIndexY = matrix->XY(x, y + 1);
        int pixelIndex = matrix->XY(x, y);
        leds[pixelIndexY] = leds[pixelIndex];
      }
    }
  }
}
