let dtImages, lienzo;
let backgroundImage = new Image();
let inProcessImage = [];
backgroundImage.src = "./cumpleanios/fondoCumpleanioEmpleado.png";
let imageFelizCumpleanio = new Image();
imageFelizCumpleanio.src = "./cumpleanios/felizcumpleaniosTarjeta.png";

onload(() => {
    canvasPreview.width = 1125;
    canvasPreview.height = 900;
    lienzo = canvasPreview.getContext("2d");
    dtImages = initDataTable("#tblImages", true, {
        columns: [{
            select: 1,
            type: "other",
            render: (value, cell, dataIndex, _cellIndex) => {
                cell.childNodes = [{
                    nodeName: "IMG",
                    attributes: {
                        height: "20px",
                        src: value.base64,
                        title: value.file.name
                    }
                }]
            }
        }, {
            select: [2,3,4,5],
            type: "number"
        }]
    }, { csv: false });
    dtImages.on('datatable.update', () => {
        lienzo.clearRect(0, 0, canvasPreview.clientWidth, canvasPreview.height)
        dtImages.data.data.forEach(row => {
            let image = new Image();
            image.src = dtImages.data.data[0].cells[1].data.base64;
            lienzo.drawImage(
                image,
                dtImages.data.data[0].cells[2].data,
                dtImages.data.data[0].cells[3].data,
                dtImages.data.data[0].cells[4].data,
                dtImages.data.data[0].cells[5].data
            );
        });
    });
    
});

function addImages() {
    if (fileImages.files.length == 0) return;
    for (file of fileImages.files) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const image = new Image();
            image.onload = function () {
                inProcessImage.push({
                    file: {
                        file: fileImages.files[inProcessImage.length],
                        base64: image.src
                    },
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height
                })
                insertDtImages();
            };
            image.src = e.target.result;
        };

        reader.onerror = function (error) {
            console.error('Error al leer la imagen:', error);
        };

        reader.readAsDataURL(file);
    }
}

function insertDtImages() {
    if (fileImages.files.length != inProcessImage.length) return;
    fileImages.value = "";
    let zIndex = dtImages.data.data.length;
    dtImages.insert({
        data: inProcessImage.map(x => [
            ++zIndex,
            x.file,
            x.x,
            x.y,
            x.width,
            x.height,
        ])
    });
    inProcessImage = [];
}