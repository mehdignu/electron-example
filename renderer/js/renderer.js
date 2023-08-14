const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e) {
    const file = e.target.files[0];
    if (!isFileImage(file)) {
        alertError('please select a valid image');
        return;
    }

    // GET original dimentions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    }

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageresizer')
}

// Send image data to main
function sendImage(e) {
    e.preventDefault();
    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if (!img.files[0]) {
        alertError('Please upload an image');
        return;
    }

    if (width === ''  ||  height === '') {
        alertError('please fill in height and width');
        return;
    }

    // Send to main using ipCrenderer
    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height
    });
}

// Catch the image:done event
ipcRenderer.on('image:done', () => {
    alertSuccess('Image resized');
});


// Make sure files is image
function isFileImage(file) {
    const acceptedImagetypes = ['iage/gif', 'image/png', 'image/jpeg'];
    return file && acceptedImagetypes.includes(file['type']);
}

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 500,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center'
        }
    });
}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 500,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center'
        }
    });
}


img.addEventListener('change', loadImage);

form.addEventListener('submit', sendImage);