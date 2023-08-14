const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform == 'darwin';

let mainWindow;

// Create main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });


    // open devtools if in dev env
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }


    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create about window 
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });


    // open devtools if in dev env
    if (isDev) {
        aboutWindow.webContents.openDevTools();
    }


    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// App is ready
app.whenReady().then(() => {
    createMainWindow();

    // Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    // Remove mainWindow from memory on close
    mainWindow.on('closed', () => (mainWindow = null));


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
  });
});

// Menu template
const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }]: []),
    {
       role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }]: [])
]

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer');
    resizeImage(options);
});

//resize the image
async function resizeImage({imgPath, width, height, dest}) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });
        const filename = path.basename(imgPath);
        // Create dest folder if not exists
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        // Write the file to the destination 
        fs.writeFileSync(path.join(dest, filename), newPath);

        // Send success to renderer
        mainWindow.webContents.send('image:done');

        // Open dest folder
        shell.openPath(dest);

    } catch (error) {
        console.log(error);
    }
}


app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
});