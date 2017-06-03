
const schedule   = require('node-schedule'),
      dateFormat = require('dateformat'),
      fs         = require('fs'),
      dotenv     = require('dotenv');

dotenv.load() // Load env vars

const url = 'http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=' + process.env.OPENWEATHERMAPAPIKEY;

exports.setSchedule = function () {

    // Setup daily timer function
    var rule    = new schedule.RecurrenceRule();
    rule.hour   = new Date().getHours();
    rule.minute = new Date().getMinutes() + 1;

    var alfredHelper = require('../helper.js'),
        logger       = require('winston'),
        lightshelper = require('../skills/lights/lightshelper.js'),
        dailyTimer   = new schedule.scheduleJob(rule, function() {

            //=========================================================
            // Set the daily timers
            //=========================================================
            var scheduleSettings = JSON.parse(require('fs').readFileSync('./scheduleSettings.json', 'utf8')),
                tmpRule,
                tmpTimer,
                tmpXY;

            logger.info('Running daily scheduler');

            //=========================================================
            // Cancel any existing timers
            //=========================================================
            timers.forEach(function(value) {
                value.cancel();
            });

            //=========================================================
            // Set up morning lights on timer
            //=========================================================
            tmpTimer       = null;
            tmpRule        = new schedule.RecurrenceRule(),
            tmpRule.hour   = scheduleSettings.morning[0].on_hr;
            tmpRule.minute = scheduleSettings.morning[0].on_min;

            scheduleSettings.morning[0].lights.forEach(function(value) {
                if(value.onoff == 'on') {
                    tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                        if (typeof value.x == 'undefined' || value.x == null) {
                            lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                        } else {
                            lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.x, value.y);
                        };
                    });
                    timers.push(tmpTimer);
                    logger.info('Morning schedule: ' + value.name + ' to be turned ' + value.onoff + ' at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
                    tmpTimer = null;
                    tmpRGB = null;
                };
            });

            //=========================================================
            // Set up morning lights off timer
            //=========================================================
            tmpRule        = new schedule.RecurrenceRule(),
            tmpRule.hour   = scheduleSettings.morning[0].off_hr;
            tmpRule.minute = scheduleSettings.morning[0].off_min;
            tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                lightshelper.allOff();
            });
            timers.push(tmpTimer);
            logger.info('Morning schedule: All lights off at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));

            //=========================================================
            // Set up the timer for sunset
            //=========================================================
            
            // Get sunset data
            alfredHelper.requestAPIdata(url)
            .then(function(apiData) {

                // Cancel the existing timers
                if (typeof sunSetTimer !== 'undefined') {
                    sunSetTimer.cancel(); 
                };

                // Set sunset timer
                sunSet = new Date(apiData.body.sys.sunset);
                sunSet.setHours(sunSet.getHours() + 12); // Add 12 hrs as for some resion the api returnes it as am!
                sunSet.setHours(sunSet.getHours() - scheduleSettings.evening[0].offset_hr); // Adjust according to the setting
                sunSet.setMinutes(sunSet.getMinutes() - scheduleSettings.evening[0].offset_min); // Adjust 
                
                tmpRule        = new schedule.RecurrenceRule(),
                tmpRule.hour   = sunSet.getHours();
                tmpRule.minute = sunSet.getMinutes();
                scheduleSettings.evening[0].lights.forEach(function(value) {
                    if (value.onoff == 'on') {
                        tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                            if (typeof value.x == 'undefined' || value.x == null) {
                                lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                            } else {
                                lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.x, value.y);
                            };
                        });
                        timers.push(tmpTimer);
                        logger.info('Evening schedule: ' + value.name + ' to be turned ' + value.onoff + ' at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
                        tmpTimer = null;
                    };
                });
            })
            .catch(function(err) {
                logger.error('Evening get data Error: ' + err);
                return false;
            });

            //=========================================================
            // Set up night lights off timer
            //=========================================================
            tmpRule        = new schedule.RecurrenceRule(),
            tmpRule.hour   = scheduleSettings.evening[0].off_hr;
            tmpRule.minute = scheduleSettings.evening[0].off_min;
            tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                lightshelper.allOff();
            });
            timers.push(tmpTimer);
            logger.info('Evening schedule: All lights off at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));

            //=========================================================
            // Set up mevening TV lights on timer
            //=========================================================
            tmpTimer       = null;
            tmpRule        = new schedule.RecurrenceRule(),
            tmpRule.hour   = scheduleSettings.eveningtv[0].on_hr;
            tmpRule.minute = scheduleSettings.eveningtv[0].on_min;

            scheduleSettings.eveningtv[0].lights.forEach(function(value) {
                if(value.onoff == 'on') {
                    tmpTimer = new schedule.scheduleJob(tmpRule, function() {
                        if (typeof value.x == 'undefined' || value.x == null) {
                            lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness);
                        } else {
                            lightshelper.lightOnOff(null, value.lightID, value.onoff, value.brightness, value.x, value.y);
                        };
                    });
                    timers.push(tmpTimer);
                    logger.info('Evening TV schedule: ' + value.name + ' to be turned ' + value.onoff + ' at: ' + alfredHelper.zeroFill(tmpRule.hour,2) + ':' + alfredHelper.zeroFill(tmpRule.minute,2));
                    tmpTimer = null;
                    tmpRGB = null;
                };
            });
        });
    return true;
};