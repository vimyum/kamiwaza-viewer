/**
 * メインプロセス
 */
const electron = require('electron');
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const express = require("express");
const exapp = express();
const fs = require('fs');

let regMode = false;
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;
let mainWindow;

const template = [{
    label: 'Mode',
    submenu: [{
        label: 'register',
        type: 'checkbox',
        checked: false,
        click: (e) => {
            regMode = e.checked;
        }
    }]
    }, {
        label: 'Jump',
        submenu: [{
            label: 'top',
            type: 'normal',
            visible: true,
            click: (e) => {
                mainWindow.loadURL('file://' + __dirname + '/content.html#0');
            },
        },
        {
            label: 'list',
            type: 'normal',
            visible: true,
            click: (e) => {
                mainWindow.loadURL('file://' + __dirname + '/list.html');
            },
        }],
    }];

// 設定ファイル読みこみ
var confObj = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 680});
  mainWindow.loadURL('file://' + __dirname + '/content.html#0');

  /**
   * 開発ツールの表示
   */
  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-finish-load', () => { 
      //load後に実施したい処理はここに書く
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  /**
   * メニューの設定
   */
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

/**
 * 現在のモード（通常/登録）を応答 (未使用)
 */
ipcMain.on('mode-status', function (event, arg) {
    console.log("mode-status request is received.");
    event.returnValue = regMode;
});

/**
 * Expressのセットアップ
 */
exapp.use(express.static("public"));
exapp.listen(3000, "192.168.11.7");
exapp.get('/:id', function(req, res, next) {
    // 開発モードの場合は、RFIDのIDを送信
    if (regMode) {
        mainWindow.webContents.send('register', req.params.id);
        return res.sendStatus(200);
    }

    // 通常モードの場合は、RFIDのIDを備えるコンテンツを送信
    let target = confObj.filter((elem, idx) => {
        return elem.tags.includes(req.params.id);
    })[0];
    if (!target) {
        console.error(`failed to find appropriate content for id(${req.params.id}).`);
        res.sendStatus(404);
        return;
    }
    mainWindow.webContents.send('changeState', target);

    res.sendStatus(200);
});

