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
  var count = 100;
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

  var minSpeed = 1;
  var maxSpeed;

  var maxAcc = 1;
  var maxVertAcc = 1;

  var minBirdZ;                 // altitudes below this cause landing

  // Initialize the canvas and sizes that depend on it
  starlings.init = init;
  function init(theCanvas) {
    canvas = theCanvas;
    width = canvas.width;
    height = canvas.height;
    eyeX = -1.1*width;
    eyeZ = height/10;
    eyePos = {x: eyeX, y: eyeY, z: eyeZ};
    minX = -width/2;
    maxX = width/2;
    minY = -width/2;
    maxY = width/2;
    minZ = -height/10;
    maxZ = height-minZ;
    minBirdZ = 0.1 * height;
    maxBirdZ = 0.9 * height;
    maxSpeed = width/10;
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
      type = 'bird';
      if (i < leaderCount) {
        type = 'leader';
        bird.stepFunction = groundStep;
        bird.stepName = "groundStep";
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
      if (type != 'leader') {
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

  // Return the 2d point, in display coordinates to display the 3d point p.
  starlings.pointDisplayPos = pointDisplayPos;
  function pointDisplayPos(p) {
    var pos = xzPerspective(eyePos, p);
    return {x: pos.y-minY, y: height-(pos.z-minZ)};
  }

  // Return x/y/r to display bird at bird.pos
  starlings.birdDisplayPos = birdDisplayPos;
  function birdDisplayPos(bird) {
    if ($.isNumeric(bird)) {
      bird = birds[bird];
      if (!bird) throw('Index out of range')
    }
    var birdPos = bird.pos;
    var pos = pointDisplayPos(birdPos);
    var edgePoint = {x: birdPos.x, y: birdPos.y+(birdSize/2), z: birdPos.z};
    var edgePos = pointDisplayPos(edgePoint);
    pos.r = edgePos.x - pos.x;
    return pos;
  }

  // Draw the entire scene, including a square for the ground
  starlings.draw = draw;
  function draw() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    var twopi = 2*Math.PI;

    ctx.strokeStyle = 'lightgray';
    ctx.beginPath();
    var p1 = pointDisplayPos({x:minX, y:minY, z:0});
    ctx.moveTo(p1.x, p1.y);
    var p = pointDisplayPos({x:maxX, y:minY, z:0});
    ctx.lineTo(p.x, p.y);
    p = pointDisplayPos({x:maxX, y:maxY, z:0});
    ctx.lineTo(p.x, p.y);
    p = pointDisplayPos({x:minX, y:maxY, z:0});
    ctx.lineTo(p.x, p.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    for (var type in bytype) {
      var typeTable = bytype[type];
      var color = (type=='leader') ? 'red' : 'lightblue';
      ctx.fillStyle = color;
      ctx.beginPath();
      for (var i in typeTable) {
        var bird = typeTable[i];
        var pos = birdDisplayPos(bird);
        ctx.moveTo(pos.x, pos.y);
        ctx.arc(pos.x, pos.y, pos.r, 0, twopi);
      }
      ctx.fill();
    }
  }

  // Step all the birds to the next position
  // Does not redraw. Call starlings.draw() to do that.
  starlings.step = step;
  function step() {
    for (var i in birds) {
      stepBird(birds[i]);
    }
    for (var i in birds) {
      var bird = birds[i];
      var nextPos = bird.nextPos;
      if (nextPos) {
        delete bird.nextPos;
        bird.pos = nextPos;
      }
    }
  }

  starlings.stepBird = stepBird;
  function stepBird(bird) {
    var pos = null;
    var f = bird.stepFunction;
    if (f) {
      pos = f(bird);
    } else if (bird.following) {
      pos = followStep(bird);
    }
    if (pos) {
      bird.nextPos = pos;
    }
  }

  function vecSum(v1, v2) {
    return {x:v1.x+v2.x, y:v1.y+v2.y, z:v1.z+v2.z};
  }

  function vecDiff(v1, v2) {
    return {x:v1.x-v2.x, y:v1.y-v2.y, z:v1.z-v2.z};
  }

  function vecAbs(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
  }

  function vecScale(v, scale) {
    return {x:v.x*scale, y:v.y*scale, z:v.z*scale};
  }

  var minFollowDistance = 2*birdSize;
  var maxFollowDistance = 3*birdSize;

  function wallBounce(newpos, vel, acc) {
    function negateVel(i) {
      vel[i] = -vel[i];
      if (acc) acc[i] = -acc[i];
    }
    if (newpos.x < minX) {
      newpos.x = minX;
      negateVel('x');
    } else if (newpos.x > maxX) {
      newpos.x = maxX;
      negateVel('x');
    }
    if (newpos.y < minY) {
      newpos.y = minY;
      negateVel('y');
    } else if (newpos.y > maxY) {
      newpos.y = maxY;
      negateVel('y');
    }
  }

  function followStep(bird) {
    var following = bird.following;
    if (!following) return null;
    var followVel = following.vel;
    if (!followVel) return null;
    var pos = bird.pos;
    var followPos = following.pos;
    var dist = distance(pos, followPos);
    var vel = bird.vel;
    if (!vel) {
      vel = bird.vel = {x:0, y:0, z:0};
    }
    // *** Calculate acc ***
    acc = {x:0, y:0, z:0};

    vel = vecSum(vel, acc);
    newpos = vecSum(pos, vel);
    wallBounce(newpos, vel);
    bird.vel = vel;
    return newpos;
  }

  starlings.millis = millis;
  function millis() {
    return (new Date()).getTime();
  }

  var maxGroundTime = 3;        // seconds

  // Called when leader on the ground, and we're waiting to take off
  function groundStep(bird) {
    var takeoffTime = bird.takeoffTime;
    if (!takeoffTime) {
      var groundTime = Math.random() * maxGroundTime * 1000;
      bird.takeoffTime = millis() + groundTime;
    } else if (millis() >= takeoffTime) {
      delete bird.takeoffTime;
      bird.vel = {x:0, y:0, z:1};
      bird.targetSpeed = random(maxSpeed, minSpeed);
      bird.targetZ = random(maxBirdZ, minBirdZ);
      var ang = random(2*Math.PI);
      bird.acc = {x:Math.sin(ang), y:Math.cos(ang)}
      bird.stepFunction = leaderStep;
      bird.stepName = 'leaderStep';
      return leaderStep(bird);
    }
    return null;
  }

  // Normal step function for leader
  function leaderStep(bird) {
    var acc = bird.acc;
    var vel = bird.vel;
    if (acc) {
      vel.x += acc.x;
      vel.y += acc.y;
      targetSpeed = bird.targetSpeed;
      var speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y);
      if (speed >= targetSpeed) {
        acc = null;
        delete bird.acc;
        delete bird.targetSpeed;
        var factor = Math.sqrt(0.5)*targetSpeed/speed;
        vel.x *= factor;
        vel.y *= factor;
      }
    }
    var pos = bird.pos;
    var newpos = {x:pos.x, y:pos.y, z:pos.z}
    newpos.x += vel.x;
    newpos.y += vel.y;
    newpos.z += vel.z;
    var targetZ = bird.targetZ;
    if ($.isNumeric(targetZ)) {
      var z = newpos.z;
      if ((vel.z>0 && z>=targetZ) || (vel.z<0 && z<=targetZ)) {
        delete bird.targetZ;
        vel.z = 0;
        newpos.z = targetZ;
      }
    }
    wallBounce(newpos, vel, acc);
    return newpos;
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
