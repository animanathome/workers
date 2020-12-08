//code here for pngbase64 from canvas:

Number.prototype.toUInt = function () { return this < 0 ? this + 4294967296 : this; };
Number.prototype.bytes32 = function () { return [(this >>> 24) & 0xff, (this >>> 16) & 0xff, (this >>> 8) & 0xff, this & 0xff]; };
Number.prototype.bytes32sw = function () { return [this & 0xff, (this >>> 8) & 0xff, (this >>> 16) & 0xff, (this >>> 24) & 0xff]; };
Number.prototype.bytes16 = function () { return [(this >>> 8) & 0xff, this & 0xff]; };
Number.prototype.bytes16sw = function () { return [this & 0xff, (this >>> 8) & 0xff]; };

Array.prototype.adler32 = function (start, len) {
    switch (arguments.length) { case 0: start = 0; case 1: len = this.length - start; }
    var a = 1, b = 0;
    for (var i = 0; i < len; i++) {
        a = (a + this[start + i]) % 65521; b = (b + a) % 65521;
    }
    return ((b << 16) | a).toUInt();
};


Array.prototype.crc32 = function (start, len) {
    switch (arguments.length) { case 0: start = 0; case 1: len = this.length - start; }
    var table = arguments.callee.crctable;
    if (!table) {
        table = [];
        var c;
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++)
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            table[n] = c.toUInt();
        }
        arguments.callee.crctable = table;
    }
    var c = 0xffffffff;
    for (var i = 0; i < len; i++)
        c = table[(c ^ this[start + i]) & 0xff] ^ (c >>> 8);

    return (c ^ 0xffffffff).toUInt();
};


var createPNG = function (canvasid) {
    var imageData = Array.prototype.slice.call(canvasid.getContext("2d").getImageData(0, 0, canvasid.width, canvasid.height).data);
    var w = canvasid.width;
    var h = canvasid.height;
    var stream = [
                       0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
                       0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
               ];
    Array.prototype.push.apply(stream, w.bytes32());
    Array.prototype.push.apply(stream, h.bytes32());
    stream.push(0x08, 0x06, 0x00, 0x00, 0x00);
    Array.prototype.push.apply(stream, stream.crc32(12, 17).bytes32());
    var len = h * (w * 4 + 1);
    for (var y = 0; y < h; y++)
       imageData.splice(y * (w * 4 + 1), 0, 0);
    var blocks = Math.ceil(len / 32768);
    Array.prototype.push.apply(stream, (len + 5 * blocks + 6).bytes32());
    var crcStart = stream.length;
    var crcLen = (len + 5 * blocks + 6 + 4);
    stream.push(0x49, 0x44, 0x41, 0x54, 0x78, 0x01);
    for (var i = 0; i < blocks; i++) {
       var blockLen = Math.min(32768, len - (i * 32768));
       stream.push(i == (blocks - 1) ? 0x01 : 0x00);
       Array.prototype.push.apply(stream, blockLen.bytes16sw());
       Array.prototype.push.apply(stream, (~blockLen).bytes16sw());
       var id = imageData.slice(i * 32768, i * 32768 + blockLen);
       Array.prototype.push.apply(stream, id);
    }
    Array.prototype.push.apply(stream, imageData.adler32().bytes32());
    Array.prototype.push.apply(stream, stream.crc32(crcStart, crcLen).bytes32());

    stream.push(0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44);
    Array.prototype.push.apply(stream, stream.crc32(stream.length - 4, 4).bytes32());
    return  "data:image/png;base64," + btoa(String.fromCharCode.apply(null, stream));
};


//code here for bmpbase64 from canvas:
var encodeData = function(data) {
    var strData = "";
    if (typeof data == "string") {
        strData = data;
    } else {
        var aData = data;
        for (var i=0;i<aData.length;i++) {
            strData += String.fromCharCode(aData[i]);
        }
    }
    return btoa(strData);
}

// creates a base64 encoded string containing BMP data
// takes an imagedata object as argument
var createBMP = function(oData) {
    console.log('createBMP', oData);
    var aHeader = [];

    var iWidth = oData.width;
    var iHeight = oData.height;

    aHeader.push(0x42); // magic 1
    aHeader.push(0x4D);

    var iFileSize = iWidth*iHeight*3 + 54; // total header size = 54 bytes
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256);

    aHeader.push(0); // reserved
    aHeader.push(0);
    aHeader.push(0); // reserved
    aHeader.push(0);

    aHeader.push(54); // dataoffset
    aHeader.push(0);
    aHeader.push(0);
    aHeader.push(0);

    var aInfoHeader = [];
    aInfoHeader.push(40); // info header size
    aInfoHeader.push(0);
    aInfoHeader.push(0);
    aInfoHeader.push(0);

    var iImageWidth = iWidth;
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256);

    var iImageHeight = iHeight;
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256);

    aInfoHeader.push(1); // num of planes
    aInfoHeader.push(0);

    aInfoHeader.push(24); // num of bits per pixel
    aInfoHeader.push(0);

    aInfoHeader.push(0); // compression = none
    aInfoHeader.push(0);
    aInfoHeader.push(0);
    aInfoHeader.push(0);

    var iDataSize = iWidth*iHeight*3;
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256);

    for (var i=0;i<16;i++) {
        aInfoHeader.push(0);    // these bytes not used
    }

    var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

    var aImgData = oData.data;

    var strPixelData = "";
    var y = iHeight;
    do {
        var iOffsetY = iWidth*(y-1)*4;
        var strPixelRow = "";
        for (var x=0;x<iWidth;x++) {
            var iOffsetX = 4*x;

            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+2]);
            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+1]);
            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX]);
        }
        for (var c=0;c<iPadding;c++) {
            strPixelRow += String.fromCharCode(0);
        }
        strPixelData += strPixelRow;
    } while (--y);

    var strEncoded = encodeData(aHeader.concat(aInfoHeader)) + encodeData(strPixelData);

    return "data:image/bmp;base64,"+strEncoded;
}

// // BMPbase64  usage onload
// var canvasbmp = document.getElementById("canvasbmp");
// var ctxbmp = canvasbmp.getContext("2d");
// ctxbmp.fillStyle="#FF0000";//fill color in to canvas  here..
// ctxbmp.fillRect(0,0,170,100);
// var imagedata= ctxbmp.getImageData(0, 0, canvasbmp.width, canvasbmp.height);
// var bmpbase64data=createBMP(imagedata);//it will  returns me the bmpbase64 data.
//
//
// document.getElementById("testimagebmp").src =bmpbase64data;
//
//
// // pngbase64  usage onload
// var canvaspng = document.getElementById("canvaspng");
// var ctxpng = canvaspng.getContext("2d");
// ctxpng.fillStyle="#FF0000";//fill color in to canvas  here..
// ctxpng.fillRect(0,0,170,100);
// var imagedata= ctxpng.getImageData(0, 0, canvaspng .width, canvaspng.height);
// var pngbase64data= createPNG(imagedata);//it will  returns me the pngbase64 data.
// document.getElementById("testimagepng").src =pngbase64data;
//
// //html code here
// <canvas id="canvasbmp" width="200" height="100" style="border:2px solid #c3c3c3;"></canvas>
// <canvas id="canvaspng" width="200" height="100" style="border:2px solid #c3c3c3;"></canvas>
//
// <img id="testimagebmp"  width="200" height="100" style="border:2px solid #c3c3c3;" />
// <img id="testimagepng"  width="200" height="100" style="border:2px solid #c3c3c3;" />
