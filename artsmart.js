/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var selectedObject = null;

var recoupLeft, recoupTop;

var top_z = 10;

function bringToTop(element)
{
    element.style.zIndex = ++top_z;
}

function getString(subString, string){
    return (string.match(new RegExp("\S*" + subString + "\S*")) || [null])[0];
}
/* Hack to make dragging work with position: absolute */
var dragConfig = {
    start: function (event, ui) {
        
        selectedObject = $(this)[0];
        bringToTop(selectedObject);
        var left = parseInt($(this).css('left'),10);
        left = isNaN(left) ? 0 : left;
        var top = parseInt($(this).css('top'),10);
        top = isNaN(top) ? 0 : top;
        recoupLeft = left - ui.position.left;
        recoupTop = top - ui.position.top;
    },
    drag: function (event, ui) {
        ui.position.left += recoupLeft;
        ui.position.top += recoupTop;
    }
};
function basename(path) {
    return path.split(/[\\/]/).pop();
}

function getRotation(el) {
    var st = window.getComputedStyle(el, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
             st.getPropertyValue("-moz-transform") ||
             st.getPropertyValue("-ms-transform") ||
             st.getPropertyValue("-o-transform") ||
             st.getPropertyValue("transform") ||
             "FAIL";

    // With rotate(30deg)...
    // matrix(0.866025, 0.5, -0.5, 0.866025, 0px, 0px)

    // rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix
    if(tr === "FAIL" || tr === "none")
        return 0;
    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    var scale = Math.sqrt(a*a + b*b);

    // arc sin, convert from radians to degrees, round
    var sin = b/scale;
    // next line works for 30deg but not 130deg (returns 50);
    // var angle = Math.round(Math.asin(sin) * (180/Math.PI));
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    
    return angle;
}
function rotateObject(degree) {
    if(selectedObject === null)
        return;
    degree = getRotation(selectedObject) + degree;
    selectedObject.style.webkitTransform = 'rotate(' + degree + 'deg)';
    selectedObject.style.MozTransform = 'rotate(' + degree + 'deg)';
    selectedObject.style.msTransform = 'rotate(' + degree + 'deg)';
    selectedObject.style.OTransform = 'rotate(' + degree + 'deg)';
    selectedObject.style.transform = 'rotate(' + degree + 'deg)';
}

function removeAllFilters(element) {
    $(element).alterClass( '*-filter');
}

function growObject(scale) {
    var prevWidth = selectedObject.clientWidth;
    var prevHeight = selectedObject.clientHeight;
    
    console.log(selectedObject.clientWidth);
    
    prevWidth *= scale;
    prevHeight *= scale;
    selectedObject.style.width = prevWidth + "px";
    selectedObject.style.height = prevHeight + "px";
}

function fname(filename) {
    return filename.split('.').slice(0, -1).join('.');
}
$( function() {
    $( "#helpDialog").dialog({modal: true });
    $( "#trash-can" ).droppable({
      tolerance: "touch",
      drop: function( e, ui ) {
        if (e.cancelable) {
          e.preventDefault();
        }
        $(ui.draggable).remove();
        selectedObject = null;
      }
    });
    $( ".color-button").click(function() {
        if(selectedObject === null)
            return;
        var clazzname = $(this)[0].className.split(' ')[2];
        var color = clazzname.replace("-color", "");
        console.log(color);
        removeAllFilters(selectedObject);
        selectedObject.classList.add(color + "-filter");
    });
    $( "#leftRotate").click(function() {
        rotateObject(-10);
    });
    $("#rightRotate").click(function() {
        rotateObject(10); 
    });
    $("#growButton").click(function() {
        growObject(1.1);
    });
    $("#shrinkButton").click(function() {
        growObject(1/1.1);
    });
    $( ".art-button").click(function() {
        var buttonImg = $(this).children()[0];
        if(buttonImg === undefined)
            return;
        console.log(fname(basename(buttonImg.src)));

        var img = document.createElement("div");
        img.classList.add("art-item");
        img.classList.add("unselectable");
        
        $("#canvas")[0].appendChild(img);
        var realImg = document.createElement("img");
        realImg.src = buttonImg.src;
        realImg.classList.add("art-image");
        img.appendChild(realImg);
        $(img).draggable(dragConfig);
        selectedObject = img;
    });
} );