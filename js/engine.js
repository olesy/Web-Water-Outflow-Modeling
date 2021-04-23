// Init plot engine
board = JXG.JSXGraph.initBoard('jxgbox-1', {boundingbox:[-1, 11, 4, -1], axis:true, grid:true, showCopyright:false});

// Parameter sliders
let R_slider = board.create('input', [-1, 10, '1.00', 'Input R: '], {cssStyle:'width: 100px'});
let a_slider = board.create('input', [-1, 8, '0.70', 'Input a: '], {cssStyle:'width: 100px'});
let h_slider = board.create('input', [-1, 6, '0.40', 'Input h: '], {cssStyle:'width: 100px'});

// Write to HTML table with methods points data
function update_table() {
    //
    output = "<tr><th>X</th><th>Метод Эйлера</th><th>Метод средней точки</th><th>Реальное значение</th></tr>"
    for (let i = 0; i < data_euler.length; i++) {
        if (isNaN(data_midp[i][0])) break;
        output += "<tr><td>" + data_euler[i][1].toFixed(2) + "</td><td>" + data_euler[i][0].toString() + "</td><td>" +
            data_midp[i][0].toString() + "</td><td>"
            + f_real(data_euler[i][1], parseFloat(R_slider.Value()), parseFloat(a_slider.Value()), startZ.Y()).toString()
            + "</td></tr>"
    }
    document.getElementById("table").innerHTML = output
}

// Write to HTML parameters values
let update_parameters = function(R, a, height) {
    document.getElementById("R").innerText = R.toString()
    document.getElementById("a").innerText = a.toString()
    document.getElementById("height").innerText = height.toString()
}

// Glider to move height of container
startZ = board.createElement('glider', [0, 10, board.defaultAxes.y], {
    name:'Height',
    strokeColor:'blue',
    fillColor:'blue'
});

// Methods results data
let data_euler;
let data_midp;
let data_real;

// Euler method function
function solve_euler(x0, I, dt, f) {
    let data = [x0];
    let N = (I[1] - I[0]) / dt;
    for (let i = 1; i < N; ++i) {
        let dx_dt = data[i - 1][0] + dt * f(0, data[i - 1])[0];
        data.push([dx_dt]);
    }
    return data
}

// Midpoint method function
function solve_midpoint(x0, I, dt, f) {
    let data = [x0];
    let N = (I[1] - I[0]) / dt;
    for (let i = 1; i < N; ++i) {
        let dx_dt = data[i - 1][0] + dt * f(0, data[i - 1][0] + dt / 2 * f(0, data[i - 1][0]))
        data.push([dx_dt]);
    }
    return data
}

// Root function x(t)
let f_real = function (t1, R, a, height) {
    let g = 9.80665
    let c1 = Math.sqrt(2 * height) / (R * R)
    let y1 = [];
    y1[0] = (Math.pow(a, 4) * g * Math.pow(t1, 2)) / (2 * Math.pow(R, 4)) + Math.pow(R, 4) * Math.pow(c1, 2) / 2 - Math.pow(a, 2) * Math.sqrt(g) * c1 * t1
    return y1;
}

// Analytical solution function with step dt (for plot)
function solve_real(x0, I, R, a, dt, height) {
    let data = [x0];
    let g = 9.80665
    I[1] = Math.pow(R, 2) / Math.pow(a, 2) * Math.sqrt(2 * height / g)
    let N = (I[1] - I[0]) / dt;
    for (let i = 1; i < N; i++) {
        data.push([f_real(I[0] + dt * i, R, a, height)]);
    }
    return data
}

// Universal ODE solver (any method)
function ode1(method = "real", R, a, h, height, update) {
    let I1 = [0, 6];
    if (h <= 0) h = 1
    if (a > R) a = R
    if (a <= 0) a = 1
    if (R <= 0) R = 1
    if (method === "real") {
        h = 0.01;
    }
    update(R, a, height)

    // xdot(t)
    let f1 = function (t1, x1) {
        let g = 9.80665
        let y1 = [];
        y1[0] = -(a * a) / (R * R) * Math.sqrt(2 * g * x1)
        return y1;
    };

    let x01 = [height];
    let data1 = []
    if (method === "euler") {
        data1 = solve_euler(x01, I1, h, f1);
    } else if (method === "midpoint") {
        data1 = solve_midpoint(x01, I1, h, f1)
    } else if (method === "real") {
        data1 = solve_real(x01, I1, R, a, h, height)
    }

    let q1 = I1[0];
    for (let i = 0; i < data1.length; i++) {
        data1[i].push(q1);
        q1 += h;
    }
    return data1;
}

// Evaluating methods
data_euler = ode1("euler", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
data_midp = ode1("midpoint", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
data_real = ode1("real", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);

update_table()

let tM = [];
let tR = [];
let dataZ = [];
let dataZM = [];
let dataZR = [];
for (let i = 0; i < data_euler.length; i++) {
    dataZ[i] = data_euler[i][0];
    dataZM[i] = data_midp[i][0];
    tM[i] = data_euler[i][1];
}
for (let i = 0; i < data_real.length; i++) {
    dataZR[i] = data_real[i][0]
    tR[i] = data_real[i][1]
}

// Plots setup

g_euler = board.createElement('curve', [tM, dataZ], {strokeColor:'red', strokeWidth:'3px'});
g_euler.updateDataArray = function () {
    data_euler = ode1("euler", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_euler.length; i++) {
        this.dataX[i] = data_euler[i][1];
        this.dataY[i] = data_euler[i][0];
    }
};
let p_euler = board.create('glider', [g_euler], {name:'EU', strokeColor:'red', fillColor:'black'});

g_midpoint = board.createElement('curve', [tM, dataZM], {strokeColor:'green', strokeWidth:'3px'});
g_midpoint.updateDataArray = function () {
    data_midp = ode1("midpoint", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_midp.length; i++) {
        this.dataX[i] = data_midp[i][1];
        this.dataY[i] = data_midp[i][0];
    }
};
let p_midpoint = board.create('glider', [g_midpoint], {name:'MP', strokeColor:'green', fillColor:'black'});

g_real = board.createElement('curve', [tR, dataZR], {strokeColor:'blue', strokeWidth:'1px'});
g_real.updateDataArray = function () {
    data_real = ode1("real", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_real.length; i++) {
        this.dataX[i] = data_real[i][1];
        this.dataY[i] = data_real[i][0];
    }
};
let p_real = board.create('glider', [g_real], {name:'Real', strokeColor:'blue', fillColor:'black'});


2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
$(document).ready(function() {
    try {
        $('body').ripples({
            resolution: 512,
            dropRadius: 20, //px
            perturbance: 0.04,
        });
        $('main').ripples({
            resolution: 128,
            dropRadius: 10, //px
            perturbance: 0.04,
        });
    }
    catch (e) {
        $('.error').show().text(e);
    }

    $('.disable').show().on('click', function() {
        $('body, main').ripples('destroy');
        $(this).hide();
    });

    setInterval(function() {
        var $el = $('main');
        var x = Math.random() * $el.outerWidth();
        var y = Math.random() * $el.outerHeight();
        var dropRadius = 20;
        var strength = 0.04 + Math.random() * 0.04;

        $el.ripples('drop', x, y, dropRadius, strength);
    }, 400);
});
