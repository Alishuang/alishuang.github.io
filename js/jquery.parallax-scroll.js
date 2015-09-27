$(function() {
    ParallaxScroll.init();
});

$(".header").fadeIn("fast",function(){
      $(".intro").fadeIn("fast", function(){
           // etc.
      });
   });

function getY() {
    var width = window.innerWidth;
    if (width > 1200) {
        return 260; // 1201 ~ 
    } else if (width > 960) {
        return 150; // 961 ~ 1200
    } else if (width > 760) {
        return 100; // 761 ~ 960
    } else if (width > 480){
        return 40;  // 481 ~ 760
    } else {
        return 30;  // ~ 480
    }
}

var ParallaxScroll = {
    /* PUBLIC VARIABLES */
    showLogs: false,
    round: 100,

    /* PUBLIC FUNCTIONS */
    init: function() {
        this._log("init");
        if (this._inited) {
            this._log("Already Inited");
            this._inited = true;
            return;
        }
        this._requestAnimationFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(/* function */ callback, /* DOMElement */ element){
                      window.setTimeout(callback, 1000 / 60);
                  };
        })();
        this._onScroll(true);
    },

    /* PRIVATE VARIABLES */
    _inited: false,
    _properties: ['x', 'y', 'z', 'rotateX', 'rotateY', 'rotateZ'],
    _requestAnimationFrame:null,

    /* PRIVATE FUNCTIONS */
    _log: function(message) {
        if (this.showLogs) console.log("Parallax Scroll / " + message);
    },
    _onScroll: function(noSmooth) {
        var scroll = $(document).scrollTop();
        var windowHeight = $(window).height();
        this._log("onScroll " + scroll);
        $("[data-parallax]").each($.proxy(function(index, el) {
            var $el = $(el);
            var properties = [];
            var data = $el.data("parallax");
            var style = $el.data("style");
            if (style == undefined) {
                style = $el.attr("style") || "";
                $el.data("style", style);
            }

            data["y"] = getY();

            var scrollFrom = data["from-scroll"];
            if (scrollFrom == undefined) scrollFrom = Math.max(0, $(el).offset().top - windowHeight);
            scrollFrom = scrollFrom | 0;
            var scrollDistance = data["distance"];
            var scrollTo = data["to-scroll"];
            if (scrollDistance == undefined && scrollTo == undefined) scrollDistance = windowHeight;
            scrollDistance = Math.max(scrollDistance|0,1);
            if (scrollTo == undefined) scrollTo = scrollFrom + scrollDistance;
            scrollTo = scrollTo | 0;
            var smoothness = data["smoothness"];
            if (smoothness == undefined) smoothness = 30;
            smoothness = smoothness | 0;
            if (noSmooth || smoothness == 0) smoothness = 1;
            var scrollCurrent = scroll;
            scrollCurrent = Math.max(scrollCurrent, scrollFrom);
            scrollCurrent = Math.min(scrollCurrent, scrollTo);
            var applyProperties = false;
            this._properties.map($.proxy(function(prop) {
                var to = data[prop];
                if (to == undefined) return;
                to = to | 0;
                var prev = $el.data("_" + prop);
                if (prev == undefined) prev = 0;
                var next = to * ((scrollCurrent - scrollFrom) / (scrollTo - scrollFrom));
                next = Math.floor(next * this.round) / this.round;
                var val = prev + (next - prev) / smoothness;
                val = (next > 0 ? Math.ceil : Math.floor)(val * this.round) / this.round;
                if (prev != val) {
                    properties[prop] = val;
                    $el.data("_" + prop, val);
                    applyProperties = true;
                }
            }, this));
            if (applyProperties) {
                if (properties["z"] != undefined) {
                    var perspective = data["perspective"];
                    if (perspective == undefined) perspective = 800;
                    var $parent = $el.parent();
                    if(!$parent.data("style")) $parent.data("style", $parent.attr("style") || "");
                    $parent.attr("style", "perspective:" + perspective + "px; -webkit-perspective:" + perspective + "px; "+ $parent.data("style"));
                }
                var translate3d = "translate3d(" + (properties["x"] ? properties["x"] : 0) + "px, " + (properties["y"] ? properties["y"] : 0) + "px, " + (properties["z"] ? properties["z"] : 0) + "px)";
                var rotate3d = "rotateX(" + (properties["rotateX"] ? properties["rotateX"] : 0) + "deg) rotateY(" + (properties["rotateY"] ? properties["rotateY"] : 0) + "deg) rotateZ(" + (properties["rotateZ"] ? properties["rotateZ"] : 0) + "deg)";
                var cssTransform = translate3d + " " + rotate3d + ";";
                this._log(cssTransform);
                $el.attr("style", "transform:" + cssTransform + " -webkit-transform:" + cssTransform + " " + style);
            }
        }, this));
        if(window.requestAnimationFrame) {
            window.requestAnimationFrame($.proxy(this._onScroll, this, false));
        }
        else {
            this._requestAnimationFrame($.proxy(this._onScroll, this, false));
        }
    }
}