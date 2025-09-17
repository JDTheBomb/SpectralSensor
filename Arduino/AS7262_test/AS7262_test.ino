/***************************************************************************
  This is a library for the Adafruit AS7262 6-Channel Visible Light Sensor

  This sketch reads the sensor

  Designed specifically to work with the Adafruit AS7262 breakout
  ----> http://www.adafruit.com/products/3779
  
  These sensors use I2C to communicate. The device's I2C address is 0x49
  Adafruit invests time and resources providing this open source code,
  please support Adafruit andopen-source hardware by purchasing products
  from Adafruit!
  
  Written by Dean Miller for Adafruit Industries.
  BSD license, all text above must be included in any redistribution
 ***************************************************************************/

#include <Wire.h>
#include "Adafruit_AS726x.h"
#include <ArduinoJson.h>
#include <ArduinoJson.hpp>

//create the object
Adafruit_AS726x ams;

//buffer to hold raw values
uint16_t sensorValues[AS726x_NUM_CHANNELS];

//buffer to hold calibrated values (not used by default in this example)
//float calibratedValues[AS726x_NUM_CHANNELS];

StaticJsonDocument<250> doc;

void setup() {
  Serial.begin(115200);

  JsonDocument doc;
  while(!Serial);
  
  // initialize digital pin LED_BUILTIN as an output.
  pinMode(LED_BUILTIN, OUTPUT);

  //begin and make sure we can talk to the sensor
  if(!ams.begin()){
    Serial.println("could not connect to sensor! Please check your wiring.");
    while(1);
  }
}

void loop() {

  //read the device temperature
  // Clear the document for each new reading to prevent old data from sticking around
  doc.clear();

  doc["temperature"] = ams.readTemperature();
  ams.startMeasurement();

  // Wait till data is available
  bool rdy = false;
  while (!rdy) {
    rdy = ams.dataReady();
  }

  // Read the values!
  ams.readRawValues(sensorValues);

  // Add all data to the JsonDocument
  doc["violet"] = sensorValues[AS726x_VIOLET];
  doc["blue"] = sensorValues[AS726x_BLUE];
  doc["green"] = sensorValues[AS726x_GREEN];
  doc["yellow"] = sensorValues[AS726x_YELLOW];
  doc["orange"] = sensorValues[AS726x_ORANGE];
  doc["red"] = sensorValues[AS726x_RED];

  // Serialize the JsonDocument and print it to the serial monitor
  serializeJson(doc, Serial);
  Serial.println();
}
