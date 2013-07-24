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

        parseImage: function() {
            var element = this.src.element, width, height;

            width   = element.width     || element.naturalHeight;
            height  = element.height    || element.naturalHeight;

            /*
            *   Save source image attributes for later use
            */
            this.src.style  = element.style;
            this.src.id     = element.id;
            this.src.class  = element.class;
            this.src.width  = width;
            this.src.height = height;

            /*
            *   Create canvas
            */
            this.canvas = document.createElement('canvas');
            this.ctx    = this.canvas.getContext && this.canvas.getContext('2d');

            this.canvas.id      = this.src.id;
            this.canvas.class   = this.src.class;
            this.canvas.width   = this.src.width;
            this.canvas.height  = this.src.height;

            element.parentNode.replaceChild(this.canvas, element);

            /*
            *   Check for browser canvas compatability
            */
            if (!this.ctx)
                this.utils.error('Unsupported browser, pixelate.js requires an HTLM5 capable browser');

            /*
            *   Draw source image temp. for parsing
            */
            this.ctx.drawImage(element, 0, 0);

            this.src.data = this.ctx.getImageData(0, 0, width, height).data;

            this.renderFrame();

        },

        renderFrame: function() {
            var ctx         = this.ctx,
                cellSize    = this.defaults.cellSize,
                data        = this.src.data,
                width       = this.src.width,
                height      = this.src.height;

            var x = 0,
                y = 0,
                i = 0;

            this.utils.perf.start();

            /*
            *   Calculate how many cells to render
            */
            var cells = Math.ceil(width / cellSize) * Math.ceil(height / cellSize);

            /*
            *   Clear previous frame
            */
            ctx.clearRect(0, 0, width, height);

            while (i < cells) {
                var pixelIndex  = (x + y * width) * 4,
                    red         = data[pixelIndex],
                    green       = data[pixelIndex + 1],
                    blue        = data[pixelIndex + 2],
                    alpha       = data[pixelIndex + 3] / 255;

                ctx.fillStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
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
