

/*
*
*/
var Pixelate = function(element, options) {
    'use strict';

    var self = this;

    /*
    *   Default library options
    */
    this.defaults = {
        cellSize: 30,
        animate: false,
        cellStartSize: null,
        cellEndSide: null,
        frameWidth: null,
        frameHeight: null
    };

    /*
    *   Extend default library options passed by user
    */
    for (var key in options)
        if (options.hasOwnProperty(key))
            if (this.defaults[key]) this.defaults[key] = options[key];

    /*
    *   Store image element and properties
    */
    this.src = {
        element: element
    };

    /*
    *   Store computed cells
    */
    this.cells = [];

    /*
    *   Wait for image load the initiate
    */
    this.src.element.onload = function() {
        console.log('init');

        self.init();



    };

};

Pixelate.prototype = {

    init: function() {

        this.utils.perf.start();

        this.parseImage();

    },

    parseImage: function() {
        var element = this.src.element, width, height;

        width = this.src.width = element.width || element.naturalHeight;
        height = this.src.height = element.height || element.naturalHeight;
        this.src.style  = element.style;

        /*
        *   Create temporary <canvas> to parse image
        */
        var canvas = this.createCanvas('pixelate-tmp-canvas', false),
            ctx = canvas.getContext && canvas.getContext('2d');

        /*
        *   Check for browser canvas compatability
        */
        if (!ctx)
            this.utils.error('Unsupported browser, pixelate.js requires an HTLM5 capable browser');

        ctx.drawImage(element, 0, 0);

        var data = ctx.getImageData(0, 0, width, height).data,
            dataLen = data.length,
            cells = [],
            i = 0;

        while (i < dataLen) {
            var cell = [data[i], data[i + 1], data[i + 2], data[i + 3]];

            cells.push(cell);

            i += 4;
        }

        this.cells = cells;
        console.log('paintImage');
        this.paintImage();

        this.utils.perf.end();

    },

    createCanvas: function(id, appendElement) {
        var src = this.src,
            canvas = document.createElement('canvas');

        canvas.id = id;
        canvas.width = src.width;
        canvas.height = src.height;

        if (appendElement) src.element.parentNode.appendChild(canvas);

        return canvas;
    },

    paintImage: function() {
        var canvas = this.createCanvas('pixelate-canvas', true),
            ctx = canvas.getContext('2d'),
            cells = this.cells,
            width = this.src.width;
            height = this.src.height;

        var pixel = ctx.createImageData(1, 1),
            pixelData = pixel.data;

        var cellsLen = cells.length,
            i = 0,
            x = 0,
            y = 0;

        while (i < cellsLen) {
            var cell = cells[i];

            pixelData[0] = cell[0];
            pixelData[1] = cell[1];
            pixelData[2] = cell[2];
            pixelData[3] = cell[3];

            ctx.putImageData(pixel, x, y);

            ++i; ++x;

            if (x === width + 1) {
                x = 1;
                ++y;
            }
        }

    },

    utils: {

        perf: {

            start: function() { this.startMs = +new Date(); },

            end: function() {
                this.endMs = +new Date();

                console.log('Page rendered in: ' + (this.endMs - this.startMs) + 'ms');
            }

        },

        error: function(error) {
            throw 'pixelate.js ERROR: ' + error;
        }

    }

};

