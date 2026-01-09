try {
    const botid = require('botid');
    console.log(JSON.stringify(botid, null, 2));
} catch (e) {
    console.error(e.message);
}
