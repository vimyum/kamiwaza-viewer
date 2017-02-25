const ipcRenderer = require( 'electron' ).ipcRenderer;
const fs = require('fs');

let confObj = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

let app = new Vue({
    el: '#app',
    data: {
        id: 0,
        name: 'Unkown..',
        article: 'Not sure..',
        image: './img/touch.svg',
        sound: './audio/1.mp3',
    },
});

let setContent = (app, msg) => {
    app.id = msg.id;
    app.name = msg.name;
    app.image = msg.image;
    app.sound = msg.sound;
    app.article = msg.article;
}

/**
 * コンテンツを配置
 */
let pageId = location.hash.slice(1);
if (pageId) {
    let content = confObj.filter((elem, idx) => {
        return elem.id == pageId;
    })[0];
    setContent(app, content);
}

/**
 * 通常モードでRFID読み取り
 */
ipcRenderer.on('changeState', function(ev, msg) {
    setContent(app, msg);
    audio.load();
    audio.play();
});

/**
 * 登録モードでRFID読み取り
 */
ipcRenderer.on('register', function(ev, msg) {
    audio.play();
    confObj.filter((elem) => elem.id == app.id)[0].tags.push(msg);
    fs.writeFile('config.json', JSON.stringify(confObj.sort((a,b) => a.id - b.id), null, ' '), (err) => {
        console.log(err);
    });
});
