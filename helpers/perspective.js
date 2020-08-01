const Perspective = require('perspective-api-client');
const perspective = new Perspective({apiKey: 'AIzaSyCwp4W3aRXOSKQeuMgjQ7PNPNRadsTV7pY'});
module.exports = perspect = async (text)=>{ 
    var result = await perspective.analyze(text,{attributes: ['flirtation', 'toxicity',"severe_toxicity","insult","profanity","identity_attack","sexually_explicit","threat"]});
    //console.log(JSON.stringify(result,null ,2));

    var toxicity = result.attributeScores.TOXICITY.summaryScore.value;
    var flirtation = result.attributeScores.FLIRTATION.summaryScore.value;
    var severe_toxicity = result.attributeScores.SEVERE_TOXICITY.summaryScore.value;
    var insult = result.attributeScores.INSULT.summaryScore.value;
    var profanity = result.attributeScores.PROFANITY.summaryScore.value;
    var identity_attack = result.attributeScores.IDENTITY_ATTACK.summaryScore.value;
    var sexually_explicit = result.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value;
    var threat = result.attributeScores.THREAT.summaryScore.value;

    var final_score = 0.8*toxicity + 0.3*flirtation + 0.9*severe_toxicity + 0.8*insult + 0.7*profanity + 0.8*identity_attack + 0.9*sexually_explicit + 0.7*threat;
    console.log(final_score);
    let y;
    if(final_score<2.2)
        y= 1;
    else if(final_score>=2.2 && final_score<4)
        y= 0;
    else
        y= -1;

    return new Promise((resolve,reject)=>{
        resolve(y);
    })
    // console.log("TOXICITY: " ,result.attributeScores.TOXICITY.summaryScore.value);
    // console.log("FLIRTATION: " ,result.attributeScores.FLIRTATION.summaryScore.value);
    // console.log("SEVERE_TOXICITY: " ,result.attributeScores.SEVERE_TOXICITY.summaryScore.value);
    // console.log("INSULT: " ,result.attributeScores.INSULT.summaryScore.value);
    // console.log("PROFANITY: " ,result.attributeScores.PROFANITY.summaryScore.value);
    // console.log("IDENTITY_ATTACK: " ,result.attributeScores.IDENTITY_ATTACK.summaryScore.value);
    // console.log("SEXUALLY_EXPLICIT: " ,result.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value);
    // console.log("THREAT: " ,result.attributeScores.THREAT.summaryScore.value);

};