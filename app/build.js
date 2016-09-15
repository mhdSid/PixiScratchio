/*
 * Author: mohdsidani@gmail.com
 * Created: Wednesday, September 14, 2015
 */

(function() {
    angular.module('ScratchCard', ['ngRoute']);
})();

angular.module("ScratchCard");

angular.module("ScratchCard").constant("__OPTIONS__", {
    __BRUSHBOXBOACKGROUND__: 'https://mhdsid.github.io/pixiScratchio/app/art/img/scratch.png',
    __MAINBACKGROUNDIMAGE__: 'https://mhdsid.github.io/pixiScratchio/app/art/img/background.jpeg',
    __BRUSHIMAGE__: 'https://mhdsid.github.io/pixiScratchio/pixiScratchio/app/art/img/realBrush.png',
    __PRIZEIMAGES__: "https://mhdsid.github.io/pixiScratchio/app/art/img/carr0.jpg," +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr1.jpg," +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr2.jpg-" +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr3.jpg," +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr4.jpg," +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr5.jpg-" +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr6.jpg," +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr7.jpg," +
        "https://mhdsid.github.io/pixiScratchio/app/art/img/carr8.jpg",
    __BRUSHBOXWIDTH__: 500,
    __BRUSHBOXHEIGHT__: 500,
    __BRUSHBOXPADDING__: 20,
    __MATRIXROWX__: 3,
    __MMATRIXCOLY__: 3,
    __BRUSHSIZE__: 30,
    __ROOTTEMPLATE__: '<div id="renderer"></div>'
});

(function() {
    angular.module('ScratchCard').config(configFn);
    configFn.$inject = ['$routeProvider', '$locationProvider'];

    function configFn($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: 'https://mhdsid.github.io/pixiScratchio/app/scratch-card-pixi/scratch-card-pixi.html'
            })
            .when('/scratch-card-canvas', {
                templateUrl: 'https://mhdsid.github.io/pixiScratchio/app/scratch-card-canvas/scratch-card-canvas.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    };
})();

angular.module("ScratchCard").directive("scratchboxcanvas", scratchboxcanvas);

function scratchboxcanvas() {
    var directive = {
        restrict: 'E',
        template: '<div id="renderered"></div> ',
        replace: true,
        link: linkFn
    };
    return directive;

    function linkFn(scope, element, attrs, ctrl) {
        var scratchBox = element[0];
        var padding = Number(attrs.padding);
        var matrixX = Number(attrs.matrixx);
        var matrixY = Number(attrs.matrixy);
        var width = Number(attrs.width);
        var height = Number(attrs.height);
        var brushSize = Number(attrs.brushsize);
        var fullWidth = width + (matrixX * padding) + (padding * 3);
        var fullHeight = height + (matrixY * padding) + (padding * 3);
        var imgHeight = height / matrixY;
        var imgWidth = width / matrixX;
        var length = matrixX * matrixY;
        var images = [];
        var scratchSprites = [];
        var scratchImage;
        var canvases = [];
        var contexts2D = [];
        var posX, posY, jumpY, jumpX;
        var brushImageData = new ImageData(brushSize, brushSize);
        brushImageData.data[0] = 1;
        brushImageData.data[1] = 1;
        brushImageData.data[2] = 1;
        brushImageData.data[3] = 1;
        images = JSON.parse(JSON.stringify(attrs.images)).split('-').map(function(current, index, arr) {
            return current.split(',');
        });
        canvases = [
            [],
            [],
            []
        ];
        contexts2D = [
            [],
            [],
            []
        ];
        scratchBox.style.height = fullHeight + 'px';
        scratchBox.style.width = fullWidth + 'px';
        posX = padding;
        posY = padding;
        jumpX = padding;
        jumpY = padding;
        for (var col = 0; col < matrixX; ++col) {
            jumpX = padding;
            for (var row = 0; row < matrixY; ++row) {
                canvases[row][col] = document.createElement('canvas');
                canvases[row][col].id = col;
                canvases[row][col].classList.add(row);
                canvases[row][col].width = imgWidth;
                canvases[row][col].height = imgHeight;
                canvases[row][col].style.background = 'url(' + images[col][row] + ') no-repeat center center';
                canvases[row][col].style.position = 'absolute';
                canvases[row][col].style.border = '2px solid white';
                canvases[row][col].style.left = posX + jumpX + 'px';
                canvases[row][col].style.marginTop = posY + jumpY + 'px';
                scratchBox.appendChild(canvases[row][col]);
                contexts2D[row][col] = canvases[row][col].getContext('2d');
                contexts2D[row][col].beginPath();
                contexts2D[row][col].rect(0, 0, imgWidth, imgHeight);
                contexts2D[row][col].fillStyle = "black";
                contexts2D[row][col].fill();
                canvases[row][col].addEventListener('mousemove', brush);
                canvases[row][col].addEventListener('touchstart', brush);
                jumpX += imgWidth + padding;
            }
            jumpY = jumpY + imgHeight + padding;
        }

        function brush(event) {
            var x = event.layerX;
            var y = event.layerY;
            var col = event.target.id;
            var row = event.target.className;
            contexts2D[row][col].beginPath();
            contexts2D[row][col].putImageData(brushImageData, x - (brushSize / 2), y - (brushSize / 2));
            contexts2D[row][col].fill();
        }
    }
}


var ScratchCard;
(function(ScratchCard) {
    var Scratchboxpixi = (function() {
        function Scratchboxpixi() {
            this.restrict = 'E';
            this.template = '';
            this.replace = true;
            var error;
            var injector = angular.injector(['ScratchCard']);
            var options = injector.get('__OPTIONS__');
            var $q = injector.get('$q');
            var $timeout = injector.get('$timeout');
            this.link = (window.PIXI !== undefined && window.PIXI !== null && typeof window.PIXI === 'object') ?
                linkFn :
                function() {
                    error = new Error('PixiJS script doesnt exist in the current context environment, ' +
                        'Place the script down the in document body.' +
                        'Donwload it from: http://pixijs.github.io/docs/index.html \n');
                    throw error;
            };
            if (error === undefined) {
                this.template = options.__ROOTTEMPLATE__;
            }

            function linkFn(scope, element, attrs, ctrl) {
                /*
                 *	* Private Utils *
                 */
                /*
                 *	* Main Calculated Variables Sizes used for the scrach brush box *
                 * 	*****************************************************************
                 */
                var brushBoxPadding;
                var matrixRowX;
                var matrixColY;
                var brushSize;
                var width;
                var height;
                var gameCanvasWidth;
                var gameCanvasHeight;
                var brushBoxWidth;
                var brushBoxHeight;
                var spaceBetweenBrushBoxesY;
                var spaceBetweenBrushBoxesX;
                var brushBoxPositionY;
                var brushBoxPositionX;
                /*
                 *	* Main URLS fors sprites & data used for scrath boxes  *
                 * 	********************************************************
                 */
                var brushBoxBackgroundURL;
                var mainBackgroundImageURL;
                var brushImageURL;
                var randomImages;
                /*
                 *	* Game Objects needed for building the game  *
                 * 	**********************************************
                 */
                var mainGameCanvas;
                var mainGameContext2D;
                var gameStageContainer;
                var mainBackgroundImage;
                var htmlTemplateRenderer;
                var brushBoxRandomImages = [];
                var brushBoxStage = [
                    [],
                    [],
                    []
                ];
                var brushBoxPrizeSpritesCoverOver = [
                    [],
                    [],
                    []
                ];
                var brushBoxPrizeSprites = [
                    [],
                    [],
                    []
                ];
                var brushBoxContext2Ds = [
                    [],
                    [],
                    []
                ];
                var brushBoxCanvasTexturesView = [
                    [],
                    [],
                    []
                ];
                var brushImageData;
                var scratchBoxRendererFn = [
                    [],
                    [],
                    []
                ];
                var scratchBoxBounds = [
                    [],
                    [],
                    []
                ];
                var boxPrizeCover = new Image();
                var scratchImage = new Image();
                /*
                 *	* Main math options *
                 */
                brushBoxPadding = options.__BRUSHBOXPADDING__;
                matrixRowX = options.__MATRIXROWX__;
                matrixColY = options.__MMATRIXCOLY__;
                brushSize = options.__BRUSHSIZE__;
                width = options.__BRUSHBOXWIDTH__;
                height = options.__BRUSHBOXHEIGHT__;
                brushBoxWidth = width / matrixRowX;
                brushBoxHeight = height / matrixColY;
                spaceBetweenBrushBoxesY = brushBoxPadding;
                spaceBetweenBrushBoxesX = brushBoxPadding;
                brushBoxPositionY = brushBoxPadding;
                brushBoxPositionX = brushBoxPadding;
                /*
                 *	* The prize sprites that will be randomly placed in each container *
                 */
                randomImages = options.__PRIZEIMAGES__;
                brushBoxRandomImages = JSON.parse(JSON.stringify(randomImages)).split('-').map(function(current, index, arr) {
                    return current.split(',');
                });
                /*
                 *	* Main background sprite *
                 */
                mainBackgroundImageURL = options.__MAINBACKGROUNDIMAGE__;
                mainBackgroundImage = PIXI.Sprite.fromImage(mainBackgroundImageURL);
                mainBackgroundImage.cacheAsBitmapboolean = true;
                mainBackgroundImage.name = 'mainBackgroundImage';
                mainBackgroundImage.height = gameCanvasHeight;
                mainBackgroundImage.width = gameCanvasWidth;
                mainBackgroundImage.x = 0;
                mainBackgroundImage.y = 0;
                /*
                 *	* Loading images used for scratching *
                 */
                brushBoxBackgroundURL = options.__BRUSHBOXBOACKGROUND__;
                brushImageURL = options.__BRUSHIMAGE__;
                boxPrizeCover.src = brushBoxBackgroundURL;
                boxPrizeCover.width = brushBoxWidth;
                boxPrizeCover.height = brushBoxHeight;
                scratchImage.src = brushImageURL;
                scratchImage.width = brushSize;
                scratchImage.height = brushSize;
                /*
                 *	* Main game canvas *
                 */
                gameCanvasWidth = width + (matrixRowX * brushBoxPadding) + (brushBoxPadding * 3);
                gameCanvasHeight = height + (matrixColY * brushBoxPadding) + (brushBoxPadding * 3);
                mainGameCanvas = new PIXI.CanvasRenderer(gameCanvasWidth, gameCanvasHeight);
                mainGameCanvas.interactive = true;
                mainGameCanvas.transparent = true;
                mainGameContext2D = mainGameCanvas.view.getContext('2d');
                /*
                 *	* Main game container *
                 */
                gameStageContainer = new PIXI.Container();
                gameStageContainer.interactive = true;
                /*
                 *	* The HTML view where the game canvas will be appended *
                 */
                htmlTemplateRenderer = element[0];
                htmlTemplateRenderer.appendChild(mainGameCanvas.view);
                /*
                 *	* Add Background image *
                 */
                gameStageContainer.addChild(mainBackgroundImage);
                /*	*********************************************************
                 *	* This process renders the game and creates and fills the main display objects required for the game *
                 *	* Lazy loading images used for scratching and cover box *
                 */
                ctxPicsLoaded(boxPrizeCover, function() {}).then(function(response) {
                    ctxPicsLoaded(scratchImage, function() {}).then(function(response) {
                        //getBrushedImageData();
                        RenderGame();
                        createMatrixDisplayObjects();
                    }, function() {});
                }, function() {});
                /*
                 *	* Lazy loading images used for scratching and cover box *
                 */
                function ctxPicsLoaded(object, onloadFn) {
                    return $q(function(resolve, reject) {
                        object.onLoad = onloadFn;
                        $timeout(function() {
                            resolve('successfully.loaded.');
                        });
                    });
                }
                /*
                 *	* Get the scratched image pixel data: *** brushImageData *** *
                 *	**************************************
                 * 	******* the image will be used instead of the default rectangle when using the putImageData function *******
                 */
                function getBrushedImageData() {
                    var tempCanvs = document.createElement('canvas');
                    var tempCtx = tempCanvs.getContext('2d');
                    var data;
                    var length;
                    tempCanvs.width = brushSize;
                    tempCanvs.height = brushSize;
                    /*	* Scratch image data *	*/
                    tempCtx.beginPath();
                    tempCtx.drawImage(scratchImage, 0, 0, brushSize, brushSize);
                    tempCtx.fill();
                    brushImageData = tempCtx.getImageData(0, 0, brushSize, brushSize);
                    data = brushImageData.data;
                    length = data.length;
                    // for(let i = 0; i < length; i++){  
                    //     data[i] = 1;
                    // }
                    // after the manipulation, reset the data
                    //brushImageData.data = data;
                    // and put the imagedata back to the canvas
                    tempCtx.putImageData(brushImageData, 0, 0);
                    // Review this to add your own scratch sprite
                    //brushImageData = new ImageData(brushImageData.data, brushSize, brushSize);
                    //or use the default transparent rectangle
                    //brushImageData = new ImageData(brushSize, brushSize);
                }
                /*
                 * 	* Creates the game display objects *
                 */
                function createMatrixDisplayObjects() {
                    for (var row = 0; row < matrixRowX; ++row) {
                        spaceBetweenBrushBoxesX = brushBoxPadding;
                        for (var col = 0; col < matrixColY; ++col) {
                            /*
                             *	* Brush Box Image Sprites PRIZES *
                             */
                            brushBoxPrizeSprites[row][col] = PIXI.Sprite.fromImage(brushBoxRandomImages[row][col]);
                            brushBoxPrizeSprites[row][col].cacheAsBitmapboolean = true;
                            brushBoxPrizeSprites[row][col].height = brushBoxHeight - 3;
                            brushBoxPrizeSprites[row][col].width = brushBoxWidth - 3;
                            brushBoxPrizeSprites[row][col].row = row;
                            brushBoxPrizeSprites[row][col].col = col;
                            brushBoxPrizeSprites[row][col].x = 3;
                            brushBoxPrizeSprites[row][col].y = 3;
                            /*
                             *	* Create a canvas element used as a texture for the cover sprite *
                             */
                            brushBoxCanvasTexturesView[row][col] = new PIXI.CanvasRenderer(brushBoxWidth, brushBoxHeight);
                            brushBoxCanvasTexturesView[row][col].interactive = true;
                            brushBoxCanvasTexturesView[row][col].transparent = true;
                            brushBoxCanvasTexturesView[row][col].row = row;
                            brushBoxCanvasTexturesView[row][col].col = col;
                            brushBoxCanvasTexturesView[row][col].width = brushBoxWidth;
                            brushBoxCanvasTexturesView[row][col].height = brushBoxHeight;
                            brushBoxCanvasTexturesView[row][col].x = brushBoxPositionX + spaceBetweenBrushBoxesX;
                            brushBoxCanvasTexturesView[row][col].y = brushBoxPositionY + spaceBetweenBrushBoxesY;
                            /*
                             *	* Create the context 2d for the canvas element *
                             */
                            brushBoxContext2Ds[row][col] = brushBoxCanvasTexturesView[row][col].view.getContext('2d');
                            brushBoxContext2Ds[row][col].beginPath();
                            brushBoxContext2Ds[row][col].drawImage(boxPrizeCover, 0, 0, brushBoxWidth, brushBoxHeight);
                            brushBoxContext2Ds[row][col].fill();
                            /*
                             *	* Create a texture to be used as a canvas for the cover sprite *
                             */
                            var texture = PIXI.Texture.fromCanvas(brushBoxCanvasTexturesView[row][col].view);
                            /*
                             *	* The cover sprite that has a canvas texture *
                             */
                            brushBoxPrizeSpritesCoverOver[row][col] = new PIXI.Sprite();
                            brushBoxPrizeSpritesCoverOver[row][col].cacheAsBitmapboolean = true;
                            brushBoxCanvasTexturesView[row][col].transparent = true;
                            brushBoxPrizeSpritesCoverOver[row][col].row = row;
                            brushBoxPrizeSpritesCoverOver[row][col].col = col;
                            brushBoxPrizeSpritesCoverOver[row][col].height = brushBoxHeight;
                            brushBoxPrizeSpritesCoverOver[row][col].width = brushBoxWidth;
                            brushBoxPrizeSpritesCoverOver[row][col].x = 0;
                            brushBoxPrizeSpritesCoverOver[row][col].y = 0;
                            /*	* texture represented as a canvas in order to scratch areas of this cover image *	*/
                            brushBoxPrizeSpritesCoverOver[row][col].texture = texture;
                            /*
                             *	* Brush Box Stage Containers *
                             */
                            brushBoxStage[row][col] = new PIXI.Container();
                            brushBoxStage[row][col].interactive = true;
                            brushBoxStage[row][col].height = brushBoxHeight;
                            brushBoxStage[row][col].width = brushBoxWidth;
                            brushBoxStage[row][col].row = row;
                            brushBoxStage[row][col].col = col;
                            brushBoxStage[row][col].x = brushBoxPositionX + spaceBetweenBrushBoxesX;
                            brushBoxStage[row][col].y = brushBoxPositionY + spaceBetweenBrushBoxesY;
                            /*
                             *	* Adding the Assembeled Game Objects *
                             */
                            gameStageContainer.addChild(brushBoxStage[row][col]);
                            brushBoxStage[row][col].addChild(brushBoxPrizeSprites[row][col]); // prize sprite
                            brushBoxStage[row][col].addChild(brushBoxPrizeSpritesCoverOver[row][col]); // cover sprite
                            /*
                             *	*  mousemove event and calculate the hit points *
                             */
                            brushBoxStage[row][col].on('mouseover', mouseover);
                            brushBoxStage[row][col].on('mouseout', mouseout);
                            spaceBetweenBrushBoxesX += brushBoxWidth + brushBoxPadding;
                        }
                        spaceBetweenBrushBoxesY += brushBoxHeight + brushBoxPadding;
                    }
                }
                /*
                 *	* Animate Game *
                 */
                function RenderGame() {
                    requestAnimationFrame(RenderGame);
                    mainGameCanvas.render(gameStageContainer);
                }

                function mouseover(event) {
                    var row = event.target.row;
                    var col = event.target.col;
                    brushBoxStage[row][col].on('mousemove', brushScratch);
                }

                function mouseout(event) {
                    var row = event.target.row;
                    var col = event.target.col;
                    brushBoxStage[row][col]._events['mousemove'] = null;
                }

                function brushScratch(event) {
                    /*
                     *	* Mouse X and Mouse Y from regular js event *
                     */
                    var x = event.data.global.x;
                    var y = event.data.global.y;
                    /*
                     *	* row and column of the current mousemove item *
                     */
                    var row = event.target.row;
                    var col = event.target.col;
                    brushBoxContext2Ds[row][col].beginPath();
                    brushBoxContext2Ds[row][col].translate((brushSize / 2), (brushSize / 2));
                    brushBoxContext2Ds[row][col].rotate(90 * (Math.PI / 180));
                    brushBoxContext2Ds[row][col].globalCompositeOperation = 'destination-out';
                    brushBoxContext2Ds[row][col].drawImage(scratchImage, x - brushBoxCanvasTexturesView[row][col].x - (brushSize), y - brushBoxCanvasTexturesView[row][col].y - (brushSize));
                    brushBoxContext2Ds[row][col].fill();
                }
            } //end linkFn
        } //end constructor
        Scratchboxpixi.instance = function() {
            return new Scratchboxpixi();
        };
        return Scratchboxpixi;
    })(); //end class
    angular.module('ScratchCard').directive('scratchboxpixi', Scratchboxpixi.instance);
})(ScratchCard || (ScratchCard = {}));