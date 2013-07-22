

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
    *   Wait for imageload then initiate
    */
    this.src.element.onload = function() {
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

        /*
        *   Draw source image in temp. context
        */
        ctx.drawImage(element, 0, 0);

        var data = ctx.getImageData(0, 0, width, height).data,
            dataLen = data.length,
            cells = [],
            i = 0;

        while (i < dataLen) {
            cells.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);

            i += 4;
        }

        this.cells = cells;

        this.paintImage();

    },

    /*
    *   Return a <canvas> DOM object, with id @id. Set @appendElement = true to append to DOM
    */
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
            cells = this.cells;

        var image = ctx.createImageData(this.src.width, this.src.height);
            imageData = image.data,
            cellsLen = cells.length,
            i = j = 0;

        while (j < cellsLen) {
            var cell = cells[j];

            imageData[i]        = cell[0];
            imageData[i + 1]    = cell[1];
            imageData[i + 2]    = cell[2];
            imageData[i + 3]    = cell[3];

            i += 4; ++j;
        }

        ctx.putImageData(image, 0, 0);

        this.utils.perf.end();

    },

    measureFunc: function(func) {
        var iterations = 100,
            startMs = +new Date();

        for (var i = 0; i < iterations; ++i) {

        }

        var endMs = +new Date(),
            total = startMs - endMs;

        console.log('Test took ' + total + 'ms');
    },

    utils: {

        perf: {

            start: function() {
                this.startMs = +new Date();
            },

            end: function(doReturn) {
                this.endMs = +new Date();

                if (doReturn) return this.endMs;

                console.log('Page rendered in: ' + (this.endMs - this.startMs) + 'ms');
            }

        },

        error: function(error) {
            throw 'pixelate.js ERROR: ' + error;
        }

    }

};

