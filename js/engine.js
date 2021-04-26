// Init plot engine
board = JXG.JSXGraph.initBoard('jxgbox-1', {boundingbox:[-1, 11, 4, -1], axis:true, grid:true, showCopyright:false});

// Parameter sliders
let R_slider = board.create('input', [-1, 10, '1.00', 'Input R: '], {cssStyle:'width: 100px'});
let a_slider = board.create('input', [-1, 8, '0.70', 'Input a: '], {cssStyle:'width: 100px'});
let h_slider = board.create('input', [-1, 6, '0.40', 'Input h: '], {cssStyle:'width: 100px'});

let graphs = {
    "real": [null, null, true, "Аналитическое решение"],
    "euler": [null, null, true, "Метод Эйлера"],
    "midpoint": [null, null, true, "Метод средней точки"],
    "ab2": [null, null, true, "Метод Адамса-Башфорта 2"],
    "ab3": [null, null, true, "Метод Адамса-Башфорта 3"]
}
// Write to HTML table with methods points data
function update_table() {
    //
    let output = "<tr><th>X</th>";
    for (let elem in graphs) {
        if (graphs[elem][2]) {
            output += "<th>" + graphs[elem][3] + "</th>"
        }
    }
    for (let i = 0; i < data_euler.length; i++) {
        if (isNaN(data_midp[i][0])) break;
        output += "<tr><td>" +
            data_euler[i][1].toFixed(2) + "</td><td>" +
            f_real(data_euler[i][1], parseFloat(R_slider.Value()), parseFloat(a_slider.Value()), startZ.Y()).toString()
            + "</td>"
        if (graphs["euler"][2]) {
            output += "<td>" + data_euler[i][0].toString() + "</td>"
        }
        if (graphs["midpoint"][2]) {
            output += "<td>" + data_midp[i][0].toString() + "</td>"
        }
        if (graphs["ab2"][2]) {
            output += "<td>" + data_ab2[i][0].toString() + "</td>"
        }
        if (graphs["ab3"][2]) {
            output += "<td>" + data_ab3[i][0].toString() + "</td>"
        }
        output += "</tr>"
    }
    document.getElementById("table").innerHTML = output
}

// Write to HTML parameters values
let update_parameters = function (R, a, height) {
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
let data_ab2;
let data_ab3;

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

// Adams-Bashforth 2 method function
function solve_adams_bashforth_2(x0, I, dt, f) {
    let data = [x0];
    let N = (I[1] - I[0]) / dt;
    for (let i = 1; i < N; ++i) {
        if (i === 1) {
            // RK4 for 1st iteration
            let k1 = f(0, data[i - 1][0])
            let k2 = f(0, data[i - 1][0] + dt / 2 * k1)
            let k3 = f(0, data[i - 1][0] + dt / 2 * k2)
            let k4 = f(0, data[i - 1][0] + dt * k3)
            let dx_dt = data[i - 1][0] + dt * (1 / 6 * k1 + 1 / 3 * k2 + 1 / 3 * k3 + 1 / 6 * k4)
            data.push([dx_dt]);
        } else {
            // Adams Bashforth, k=2
            let dx_dt = data[i - 1][0] + dt * (3 / 2 * f(0, data[i - 1][0]) - 1 / 2 * f(0, data[i - 2][0]))
            data.push([dx_dt]);
        }
    }
    return data
}

// Adams-Bashforth 3 method function
function solve_adams_bashforth_3(x0, I, dt, f) {
    let data = [x0];
    let N = (I[1] - I[0]) / dt;
    for (let i = 1; i < N; ++i) {
        if (i < 3) {
            // RK4 for 1st & 2nd iteration
            let k1 = f(0, data[i - 1][0])
            let k2 = f(0, data[i - 1][0] + dt / 2 * k1)
            let k3 = f(0, data[i - 1][0] + dt / 2 * k2)
            let k4 = f(0, data[i - 1][0] + dt * k3)
            let dx_dt = data[i - 1][0] + dt * (1 / 6 * k1 + 1 / 3 * k2 + 1 / 3 * k3 + 1 / 6 * k4)
            data.push([dx_dt]);
        } else {
            // Adams Bashforth, k=3
            let dx_dt = data[i - 1][0] + dt * (23 / 12 * f(0, data[i - 1][0]) - 4 / 3 * f(0, data[i - 2][0])
                + 5 / 12 * f(0, data[i - 3][0]))
            data.push([dx_dt]);
        }
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
function ode_diff_water(method = "real", R, a, h, height, update) {
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
    } else if (method === "ab2") {
        data1 = solve_adams_bashforth_2(x01, I1, h, f1)
    } else if (method === "ab3") {
        data1 = solve_adams_bashforth_3(x01, I1, h, f1)
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
data_euler = ode_diff_water("euler", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
data_midp = ode_diff_water("midpoint", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
data_ab2 = ode_diff_water("ab2", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
data_ab3 = ode_diff_water("ab3", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
data_real = ode_diff_water("real", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
    parseFloat(h_slider.Value()), startZ.Y(), update_parameters);

update_table()

let tM = [];
let tR = [];
let dataZ = [];
let dataZM = [];
let dataZR = [];
let dataZAB2 = [];
let dataZAB3 = [];
for (let i = 0; i < data_euler.length; i++) {
    dataZ[i] = data_euler[i][0];
    dataZM[i] = data_midp[i][0];
    dataZAB2[i] = data_ab2[i][0];
    dataZAB3[i] = data_ab3[i][0];
    tM[i] = data_euler[i][1];
}
for (let i = 0; i < data_real.length; i++) {
    dataZR[i] = data_real[i][0]
    tR[i] = data_real[i][1]
}

// Plots setup

g_euler = board.create('curve', [tM, dataZ], {strokeColor:'red', strokeWidth:'3px'});
g_euler.updateDataArray = function () {
    data_euler = ode_diff_water("euler", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_euler.length; i++) {
        this.dataX[i] = data_euler[i][1];
        this.dataY[i] = data_euler[i][0];
    }
};
let p_euler = board.create('glider', [g_euler], {name:'EU', strokeColor:'red', fillColor:'red'});

g_midpoint = board.create('curve', [tM, dataZM], {strokeColor:'green', strokeWidth:'3px'});
g_midpoint.updateDataArray = function () {
    data_midp = ode_diff_water("midpoint", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_midp.length; i++) {
        this.dataX[i] = data_midp[i][1];
        this.dataY[i] = data_midp[i][0];
    }
};
let p_midpoint = board.create('glider', [g_midpoint], {name:'MP', strokeColor:'green', fillColor:'green'});

g_ab2 = board.create('curve', [tM, dataZAB2], {strokeColor:'purple', strokeWidth:'3px'});
g_ab2.updateDataArray = function () {
    data_ab2 = ode_diff_water("ab2", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_ab2.length; i++) {
        this.dataX[i] = data_ab2[i][1];
        this.dataY[i] = data_ab2[i][0];
    }
};
let p_ab2 = board.create('glider', [g_ab2], {name:'AB2', strokeColor:'purple', fillColor:'purple'});

g_ab3 = board.create('curve', [tM, dataZAB3], {strokeColor:'olive', strokeWidth:'3px'});
g_ab3.updateDataArray = function () {
    data_ab3 = ode_diff_water("ab3", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_ab3.length; i++) {
        this.dataX[i] = data_ab3[i][1];
        this.dataY[i] = data_ab3[i][0];
    }
};
let p_ab3 = board.create('glider', [g_ab3], {name:'AB3', strokeColor:'olive', fillColor:'olive'});

g_real = board.create('curve', [tR, dataZR], {strokeColor:'blue', strokeWidth:'1px'});
g_real.updateDataArray = function () {
    data_real = ode_diff_water("real", parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters);
    this.dataX = [];
    this.dataY = [];
    for (let i = 0; i < data_real.length; i++) {
        this.dataX[i] = data_real[i][1];
        this.dataY[i] = data_real[i][0];
    }
};
let p_real = board.create('glider', [g_real], {name:'Real', strokeColor:'blue', fillColor:'blue'});

graphs = {
    "real": [g_real, p_real, true, "Аналитическое решение"],
    "euler": [g_euler, p_euler, true, "Метод Эйлера"],
    "midpoint": [g_midpoint, p_midpoint, true, "Метод средней точки"],
    "ab2": [g_ab2, p_ab2, true, "Метод Адамса-Башфорта 2"],
    "ab3": [g_ab3, p_ab3, true, "Метод Адамса-Башфорта 3"]
}

function update_graph(name, element) {
    let objects = graphs[name]
    if (element.checked) {
        objects[0].showElement()
        objects[1].showElement()
        objects[2] = true
    } else {
        objects[0].hideElement()
        objects[1].hideElement()
        objects[2] = false
    }
    update_table()
}
