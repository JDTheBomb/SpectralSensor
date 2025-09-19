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

// Use a larger buffer since we're creating an array of objects
StaticJsonDocument<500> doc;

void setup() {
  Serial.begin(115200);

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
  doc.clear();

  // Create a JsonArray to hold the color data.
  JsonArray dataArray = doc.createNestedArray("SpectralData");

  ams.startMeasurement();

  // Wait till data is available
  bool rdy = false;
  while (!rdy) {
    rdy = ams.dataReady();
  }

  // Read the values!
  ams.readRawValues(sensorValues);
  
  // Create and add a JSON object for each color to the array.
  // This is the fix: create the JsonObject first and then add it.
  JsonObject violet = dataArray.createNestedObject();
  violet["Color"] = "Violet";
  violet["Value"] = sensorValues[AS726x_VIOLET];
  
  JsonObject blue = dataArray.createNestedObject();
  blue["Color"] = "Blue";
  blue["Value"] = sensorValues[AS726x_BLUE];
  
  JsonObject green = dataArray.createNestedObject();
  green["Color"] = "Green";
  green["Value"] = sensorValues[AS726x_GREEN];
  
  JsonObject yellow = dataArray.createNestedObject();
  yellow["Color"] = "Yellow";
  yellow["Value"] = sensorValues[AS726x_YELLOW];
  
  JsonObject orange = dataArray.createNestedObject();
  orange["Color"] = "Orange";
  orange["Value"] = sensorValues[AS726x_ORANGE];
  
  JsonObject red = dataArray.createNestedObject();
  red["Color"] = "Red";
  red["Value"] = sensorValues[AS726x_RED];
  
  // Add the temperature separately if desired.
  doc["Temperature"] = ams.readTemperature();

  // Serialize the JsonDocument and print it to the serial monitor.
  serializeJson(doc, Serial);
  Serial.println();
}