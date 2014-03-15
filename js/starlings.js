//////////////////////////////////////////////////////////////////////
//
// starlings.js
// Distributed under the BSD 2-Clause License. See end of file.
//
//////////////////////////////////////////////////////////////////////

// Our one global variable.
// Global functions are properties of starlings
var starlings = {};

(function() {

  // State
  var canvas;
  var width;
  var height;
  var count = 10;
  var leaderCount = 1;
  var birds;
  var leaders;
  var birdSize = 10;

  var eyeX;
  var eyeY = 0;
  var eyeZ = 0;

  var minX;
  var maxX;

  var minV;
  var maxV;

  // Initialize the canvas and sizes that depend on it
  starlings.init = init;
  function init(theCanvas) {
    canvas = theCanvas;
    width = canvas.width;
    height = canvas.height;
    eyeX = -4 * width;
    minX = -width;
    maxX = width;
    minV = 1;
    maxV = width/10;
  }

  // Set theCount of birds, theLeaderCount of leader birds,
  // and initialize the bird positions and velocities
  starlings.reset = reset;
  function reset(theCount, theLeaderCount) {
    if ($.isNumeric(theCount)) count = theCount;
    if ($.isNumeric(theLeaderCount)) leaderCount = theLeaderCount;
    birds = new Array();
    leaders = new Array();
    var lc = 0;
    for (var i=0; i<count; i++) {
      var bird = {};
      birds[i] = bird;
      if (i < leaderCount) {
        bird.leader = true;
        leaders[lc++] = bird;
      }
    }
  }

  // State accessors
  starlings.theBirds = function() { return birds; }
  starlings.theLeaders = function() { return leaders; }

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
