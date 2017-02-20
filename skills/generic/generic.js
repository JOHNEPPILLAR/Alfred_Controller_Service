//=========================================================
// Setup generic skill
//=========================================================
const Skills = require('restify-router').Router;  
      skill = new Skills();

//=========================================================
// Skill: base root
//=========================================================
function root (req, res, next) {
    var responseText = '',
        aiNameText = 'My name is Alfred. I am the Pillar house Digital Assistant.',
        dt = new Date().getHours()

    // Calc which part of day
    if (dt >= 0 && dt <= 11) {
        responseText = 'Good Morning.'
    } else if (dt >= 12 && dt <= 17) {
        responseText = 'Good Afternoon.'
    } else {
        responseText = 'Good Evening.'
    }
    responseText = responseText + ' ' + aiNameText;

    // Construct the returning message
    var returnJSON = {
        code : 'sucess',
        data : responseText
    };

    // Send response back to caller
    res.send(returnJSON);
    next();
};

//=========================================================
// Skill: Hello
// Params: name: String
//=========================================================
function hello (req, res, next) {
    var responseText = '',
        aiNameText = 'My name is Alfred. How can I help you today.',
        dt = new Date().getHours(),
        name = '';

    if (req.query.name){
        name = ' ' + req.query.name;
    };

    // Calc which part of day
    if (dt >= 0 && dt <= 11) {
        responseText = 'Good Morning'
    } else if (dt >= 12 && dt <= 17) {
        responseText = 'Good Afternoon'
    } else {
        responseText = 'Good Evening'
    }
    responseText = responseText + name + '. ' + aiNameText;

    // Construct the returning message
    var returnJSON = {
        code : 'sucess',
        data : responseText
    };

    // Send response back to caller
    res.send(returnJSON);
    next();
};

//=========================================================
// Skill: Help
//=========================================================
function help (req, res, next) {
    var responseText = 'I can help you with...';

    // Construct the returning message
    var returnJSON = {
        code : 'sucess',
        data : responseText
    };
    
    // Send response back to caller
    res.send(returnJSON);
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/', root)
skill.get('/hello', hello)
skill.get('/help', help)

module.exports = skill;