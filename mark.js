var lightTable = [
16, 11, 10, 16, 24, 40, 51, 61,
12, 12, 14, 19, 26, 58, 60, 55,
14, 13, 16, 24, 40, 57, 69, 56,
14, 17, 22, 29, 51, 87, 80, 62,
18, 22, 37, 56, 68, 109, 103, 77,
24, 35, 55, 64, 81, 104, 113, 92,
49, 64, 78, 87, 103, 121, 120, 101,
72, 92, 95, 98, 112, 100, 103, 99];

var colorTable = [
17, 18, 24, 47, 99, 99, 99, 99,
18, 21, 26, 66, 99, 99, 99, 99,
24, 26, 56, 99, 99, 99, 99, 99,
47, 66, 99, 99, 99, 99, 99, 99,
99, 99, 99, 99, 99, 99, 99, 99,
99, 99, 99, 99, 99, 99, 99, 99,
99, 99, 99, 99, 99, 99, 99, 99,
99, 99, 99, 99, 99, 99, 99, 99];

function loadImage(imgId, ctx, Position) {
    var img = document.getElementById(imgId);
    var imgElement = document.getElementById('imgContent');
    switch (Position) {
        case "UL":
            ctx.drawImage(img, 20, 20);
            break;
        case "UR":
            ctx.drawImage(img, imgElement.width - 20 - img.width, 20);
            break;
        case "M":
            ctx.drawImage(img, imgElement.width / 2 - img.width / 2, imgElement.height / 2 - img.height / 2);
            break;
        case "DM":
            ctx.drawImage(img, imgElement.width / 2 - img.width / 2, imgElement.height - 5 - img.height);
            break;
        case "DR":
            ctx.drawImage(img, imgElement.width - 10 - img.width, imgElement.height - 5 - img.height);
            break;
    }
}

function turnGreen(image_data, greenV) {
    for (var x = 0; x < image_data.width; x++) {
        for (var y = 0; y < image_data.height; y++) {
            var i = x * 4 + y * 4 * image_data.width;
            var red = Math.floor(image_data.data[i] * greenV / 100);
            var blue = Math.floor(image_data.data[i + 2] * greenV / 100);
            image_data.data[i] = red;
            image_data.data[i + 2] = blue;
        }
    }
}

function data(image_data, x, y, v) {
    if (x < image_data.width && y < image_data.height) {
        return image_data.data[x * 4 + y * 4 * image_data.width + v];
    } else {
        return 255;
    }
}

function setData(image_data, x, y, v, value) {
    if (x < image_data.width && y < image_data.height) {
        image_data.data[x * 4 + y * 4 * image_data.width + v] = Math.floor(value);
    }
}

function alpha(u) {
    if (u == 0) return 1 / Math.sqrt(8);
    else return 1 / 2;
}

function DCT(X) {
    var G = new Array(64);
    for (var j = 0; j < 8; j++) {
        for (var i = 0; i < 8; i++) {
            G[i + j * 8] = 0;
            for (var y = 0; y < 8; y++) {
                for (var x = 0; x < 8; x++) {
                    G[i + j * 8] += X[x + y * 8] *
                        Math.cos((2 * x + 1) / 16 * i * Math.PI) *
                        Math.cos((2 * y + 1) / 16 * j * Math.PI);
                }
            }
            G[i + j * 8] *= alpha(i) * alpha(j);
        }
    }
    return G;
}

function IDCT(X) {
    var G = new Array(64);
    for (var j = 0; j < 8; j++) {
        for (var i = 0; i < 8; i++) {
            G[i + j * 8] = 0;
            for (var y = 0; y < 8; y++) {
                for (var x = 0; x < 8; x++) {
                    G[i + j * 8] += alpha(x) * alpha(y) *
                        X[x + y * 8] *
                        Math.cos((2 * i + 1) / 16 * x * Math.PI) *
                        Math.cos((2 * j + 1) / 16 * y * Math.PI);
                }
            }
            G[i + j * 8] = Math.round(G[i + j * 8]);
        }
    }
    return G;
}

function Quantization(G,table) {
    for (var i = 0; i < 64; i++) {
        G[i] = table[i]*Math.round(G[i]/table[i]);
    }
}

function compress(image_data, para) {
    for (var x = 0; x < image_data.width; x += 8) {
        for (var y = 0; y < image_data.height; y += 8) {
            var Y = new Array(64);
            var Cb = new Array(64);
            var Cr = new Array(64);
            for (var j = 0; j < 8; j++) {
                for (var i = 0; i < 8; i++) {
                    Y[i + j * 8] = Math.floor((data(image_data, x + i, y + j, 0) * 0.257 +
                        data(image_data, x + i, y + j, 1) * 0.504 +
                        data(image_data, x + i, y + j, 2) * 0.098 + 16)*para);
                    Cb[i + j * 8] = Math.floor((-data(image_data, x + i, y + j, 0) * 0.148 -
                        data(image_data, x + i, y + j, 1) * 0.291 +
                        data(image_data, x + i, y + j, 2) * 0.439 + 128)*para);
                    Cr[i + j * 8] = Math.floor((data(image_data, x + i, y + j, 0) * 0.439 -
                        data(image_data, x + i, y + j, 1) * 0.368 -
                        data(image_data, x + i, y + j, 2) * 0.071 + 128)*para);
                }
            }
            var YDCT = DCT(Y);
            var CbDCT = DCT(Cb);
            var CrDCT = DCT(Cr);
            Quantization(YDCT, lightTable);
            Quantization(CbDCT, colorTable);
            Quantization(CrDCT, colorTable);
            Y = IDCT(YDCT);
            Cb = IDCT(CbDCT);
            Cr = IDCT(CrDCT);
            for (var j = 0; j < 8; j++) {
                for (var i = 0; i < 8; i++) {
                    setData(image_data, x + i, y + j, 0,
                        1.164 * (Y[i + j * 8]/para - 16) + 
                            1.596 * (Cr[i + j * 8]/para - 128));
                    setData(image_data, x + i, y + j, 1,
                        1.164 * (Y[i + j * 8]/para - 16) - 
                            0.392 * (Cb[i + j * 8]/para - 128) - 
                            0.813 * (Cr[i + j * 8]/para - 128));
                    setData(image_data, x + i, y + j, 2,
                        1.164 * (Y[i + j * 8]/para - 16) + 
                            2.017 * (Cb[i + j * 8]/para - 128));
                }
            }
        }
    }
}

$(document).ready(function () {

    $("#imgxilixili").hide();
    $("#imgLSL").hide();
    $("#imgContent").hide();
    $("#load").on("click", function () {
        //获取文件
        var file = $("#imgForm").find("input")[0].files[0];
        if (!file) {
            alert("请选择文件！");
            return;
        }
        //创建读取文件的对象
        var reader = new FileReader();
        //创建文件读取相关的变量
        var imgFile;
        var imgElement = document.getElementById('imgContent'); //canvas只支持原生JS方法
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext("2d");
        //为文件读取成功设置事件
        reader.onload = function (e) {
            imgFile = e.target.result;
            $("#imgContent").attr('src', imgFile);
            setTimeout(function () {
                canvas.height = imgElement.height;
                canvas.width = imgElement.width;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(imgElement, 0, 0);
            }, 100); //等一会儿，让图片加载完再执行
        };
        //正式读取文件
        reader.readAsDataURL(file);
    });
    $("#deal").on("click", function () {
        var imgElement = document.getElementById('imgContent');
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgElement, 0, 0);
        if ($("#xilixili").prop('checked')) {
            loadImage("imgxilixili", ctx, $('input[name="xilixiliP"]:checked').val());
        }
        if ($("#LSL").prop('checked')) {
            loadImage("imgLSL", ctx, $('input[name="LSLP"]:checked').val());
        }
        if ($("#green").prop('checked')) {
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            turnGreen(imgData, parseFloat($('#greenV').val()));
            ctx.putImageData(imgData, 0, 0);
        }
        if ($("#compress").prop('checked')) {
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            compress(imgData, parseFloat($('#compressV').val())/100);
            ctx.putImageData(imgData, 0, 0);
        }
    });
});
