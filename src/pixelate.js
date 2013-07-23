;(function(window, undefined) {
    'use strict';

    /*
    *   Pixelate 0.1.0
    */
    var Pixelate = function(element, options) {

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

            this.getCells(ctx);

        },

        getCells: function(ctx) {
            var width = this.src.width,
                height = this.src.height,
                cellSize = this.defaults.cellSize,
                columns = Math.ceil(width / cellSize),
                rows = Math.ceil(height / cellSize),
                totalCells = columns * rows;

            /*
            *   Draw source image in temp. context
            */
            ctx.drawImage(element, 0, 0);

            var imageData = ctx.getImageData(0, 0, width, height).data,
                cells = [],
                x = Math.ceil(cellSize / 2),
                y = Math.ceil(cellSize / 2),
                i = 0;

            while (i < totalCells) {
                var index = (x + y * width) * 4,
                    a = imageData[index + 3] / 255,
                    cell = [imageData[index], imageData[index + 1], imageData[index + 2], a];

                cells.push(cell);

                if (x <= width) {
                    x += cellSize;
                } else {
                    x = 0;
                    y += cellSize;
                }

                ++i;

            }

            this.cells = cells;

            this.utils.perf.end('Parsed image in ');

            this.paintFrame();

        },

        paintFrame: function() {
            var canvas = this.createCanvas('pixelate-canvas', true),
                ctx = canvas.getContext('2d'),
                cells = this.cells,
                cellsLen = cells.length,
                cellSize = this.defaults.cellSize,
                width = this.src.width;

            var x = 0,
                y = 0,
                i = 0;

            this.utils.perf.start();

            while (i < cellsLen) {
                var cell = cells[i];

                ctx.fillStyle = 'rgba(' + cell[0] + ', ' + cell[1] + ', ' + cell[2] + ', ' + cell[3] + ')';
                ctx.fillRect(x, y, cellSize, cellSize);

                if (x <= width) {
                    x += cellSize;
                } else {
                    x = 0;
                    y += cellSize;
                }

                ++i;

            }

            this.utils.perf.end('Painted image in ');

        },

        utils: {

            perf: {

                start: function() {
                    this.startMs = +new Date();
                },

                end: function(message) {
                    this.endMs = +new Date();

                    console.log(message + (this.endMs - this.startMs) + 'ms');
                }

            },

            error: function(error) {
                throw 'pixelate.js ERROR: ' + error;
            }

        }

    };

    window.Pixelate = Pixelate;

})(window);
