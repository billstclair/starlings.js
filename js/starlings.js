//////////////////////////////////////////////////////////////////////
//
// starlings.js
// Distributed under the BSD 2-Clause License. See end of file.
//
//////////////////////////////////////////////////////////////////////

// Our one global variable.
// Accessible functions are properties of starlings
var starlings = {};

(function() {

  // State
  var canvas;
  var width;
  var height;
  var count = 10;
  var leaderCount = 1;
  var birds;
  var bytype;
  var birdSize = 5;

  var eyeX;
  var eyeY = 0;
  var eyeZ;
  var eyePos;

  var minX;
  var maxX;

  var minY;
  var maxY;
  
  var minZ = 0;
  var maxZ;

  var minV;
  var maxV;

  // Initialize the canvas and sizes that depend on it
  starlings.init = init;
  function init(theCanvas) {
    canvas = theCanvas;
    width = canvas.width;
    height = canvas.height;
    eyeX = -width;
    eyeZ = height/20;
    eyePos = {x: eyeX, y: eyeY, z: eyeZ};
    minX = -width/2;
    maxX = width/2;
    minY = -width/2;
    maxY = width/2;
    minZ = -height/10;
    maxZ = height+minZ;
    minV = 1;
    maxV = width/10;
  }

  // Return a random number between max and min.
  // min defaults to 0
  starlings.random = random;
  function random(max, min) {
    if (!min) min = 0;
    var len = max - min;
    return Math.random()*len + min;
  }

  // Normal 3-dimensional distance between points
  // p1 and p2 are of the form {x:x, y:y, z:z}
  starlings.distance = distance;
  function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x-p2.x, 2) +
                     Math.pow(p1.y-p2.y, 2) +
                     Math.pow(p1.z-p2.z, 2));
  }

  // Return the closest bird to the arg
  starlings.findClosestBird = findClosestBird;
  function findClosestBird(bird) {
    var pos = bird.pos;
    var closest = null;
    var dis = null;
    for (var i in birds) {
      var b = birds[i];
      if (b != bird) {
        var d = distance(pos, b.pos);
        if (closest==null || d < dis) {
          closest = b;
          dis = d;
        }
      }
    }
    return closest;
  }

  // Set theCount of birds, theLeaderCount of leader birds,
  // and initialize the bird positions and velocities
  starlings.reset = reset;
  function reset(theCount, theLeaderCount) {
    if ($.isNumeric(theCount)) count = theCount;
    if ($.isNumeric(theLeaderCount)) leaderCount = theLeaderCount;
    birds = new Array();
    bytype = {};
    var lc = 0;
    for (var i=0; i<count; i++) {
      var bird = {i:i};
      birds[i] = bird;
      type = "bird";
      if (i < leaderCount) {
        type = "leader";
      }
      bird.type = type;
      var typeTable = bytype[type];
      if (!typeTable) {
        typeTable = new Array();
        bytype[type] = typeTable;
      }
      typeTable[typeTable.length] = bird;
      var x = random(maxX, minX);
      var y = random(maxY, minY);
      var z = 0;
      bird.pos = {x:x, y:y, z:z};
      if (type != "leader") {
        var closest = findClosestBird(bird);
        bird.following = closest;
      }
    }
  }

  // Return the 2d-point where the line defined by eye & p intersects
  // the yz plane
  starlings.xzPerspective = xzPerspective;
  function xzPerspective(eye, p) {
    var dx = eye.x - p.x;
    var dy = eye.y - p.y;
    var dz = eye.z - p.z;
    // eye.x + t*dx = 0
    var t = -eye.x/dx;
    var y = eye.y + t*dy;
    var z = eye.z + t*dz;
    return {y:y, z:z};
  }

  starlings.birdDisplayPos = birdDisplayPos;
  function birdDisplayPos(bird) {
    if ($.isNumeric(bird)) {
      bird = birds[bird];
      if (!bird) throw('Index out of range')
    }
    var birdPos = bird.pos;
    var pos = xzPerspective(eyePos, birdPos);
    var edgePos =
      xzPerspective(eyePos, {x: birdPos.x, y: birdPos.y+(birdSize/2), z: birdPos.z});
    
    return {x: pos.y-minY, y: height-(pos.z-minZ), r: edgePos.y-pos.y};
  }

  // State accessors
  starlings.getBirds = function() { return birds; }
  starlings.getBytype = function() { return bytype; }
  starlings.getEyePos = function() { return eyePos; }

})();   // execute the function() at the top of the file

//////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2014, Bill St. Clair <bill@billstclair.com>
// All rights reserved.
// Distributed under the BSD 2-Clause License
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
// 
// 1. Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in the
// documentation and/or other materials provided with the distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////
