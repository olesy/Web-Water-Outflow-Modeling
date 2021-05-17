// Init plot engine
board = JXG.JSXGraph.initBoard('jxgbox-1', {
    boundingbox:[-1, 11, 4, -1],
    needsFullUpdate:true,
    keepAspectRatio:false,
    axis:true,
    grid:true,
    showCopyright:false
})

// Parameter sliders
let R_slider = board.create('input', [-1, 10, '1.00', 'Input R: '], {cssStyle:'width: 100px'})
let a_slider = board.create('input', [-1, 8, '0.70', 'Input a: '], {cssStyle:'width: 100px'})
let h_slider = board.create('input', [-1, 6, '0.40', 'Input h: '], {cssStyle:'width: 100px'})

let methods = ["euler", "midpoint", "ab2", "ab3", "imp_euler", "imp_midpoint", "am3", "am4"]

let graphs = {
    "real":[null, null, true, "z(t)", {
        "data":[],
    }, "blue", "Z", null],
    "euler":[null, null, true, "Метод Эйлера", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "red", "EU", null],
    "midpoint":[null, null, false, "Метод средней точки", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "green", "MP", null],
    "ab2":[null, null, false, "Метод Адамса-Башфорта 2", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "darkorange", "AB2", null],
    "ab3":[null, null, false, "Метод Адамса-Башфорта 3", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "hotpink", "AB3", null],
    "imp_euler":[null, null, true, "Неявный метод Эйлера", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "saddlebrown", "IEU", null],
    "imp_midpoint":[null, null, false, "Неявный метод средней точки", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "darkslateblue", "IMP", null],
    "am3":[null, null, false, "Метод Адамса-Мултона 3", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "lime", "AM3", null],
    "am4":[null, null, false, "Метод Адамса-Мултона 4", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "black", "AM4", null],
}

// Change XY range
function update_range() {
    let x_max = document.getElementById("xmax").value
    let y_max = document.getElementById("ymax").value
    board.setBoundingBox([-0.1, y_max * 0.5, x_max * 0.5, -0.4])
    board.update()
}

// Hide/show method
function update_graph(name, element) {
    let objects = graphs[name]
    if (element.checked) {
        objects[0].showElement()
        objects[1].showElement()
        objects[7].showElement()
        objects[2] = true
    } else {
        objects[0].hideElement()
        objects[1].hideElement()
        objects[7].hideElement()
        objects[2] = false
    }
    update_table()
}

// Write to HTML table methods points data, errors
function update_table() {
    let output = "<tr><th>t</th>"
    let abs_errors = output
    let errors = output
    for (let elem in graphs) {
        if (graphs[elem][2]) {
            output += "<th>" + graphs[elem][3] + "</th>"
            if (elem !== "real") {
                abs_errors += "<th>" + graphs[elem][3] + "</th>"
                errors += "<th>" + graphs[elem][3] + "</th>"
            }
        }
    }
    let real = 0
    for (let i = 0; i < graphs.euler[4].data.length; i++) {
        if (isNaN(graphs.imp_euler[4].data[i][0])) break
        real = f_real(graphs.midpoint[4].data[i][1], parseFloat(R_slider.Value()), parseFloat(a_slider.Value()), startZ.Y())
        output += "<tr><td>" +
            graphs.euler[4].data[i][1].toFixed(2) + "</td>"
        errors += "<tr><td>" +
            graphs.euler[4].data[i][1].toFixed(2) + "</td>"
        abs_errors += "<tr><td>" +
            graphs.euler[4].data[i][1].toFixed(2) + "</td>"
        if (graphs.real[2]) {
            output += "</td><td>" + real.toString() + "</td>"
        }
        for (let j of methods) {
            if (graphs[j][2]) {
                output += "<td>" + graphs[j][4].data[i][0].toString() + "</td>"
                errors += "<td>" + graphs[j][4].err[i].toString() + "</td>"
                abs_errors += "<td>" + graphs[j][4].abs_err[i].toString() + "</td>"
            }
        }
        output += "</tr>"
    }
    document.getElementById("table").innerHTML = output
    document.getElementById("errors").innerHTML = errors
    document.getElementById("abs-errors").innerHTML = abs_errors
}

// Write to HTML parameters values
let update_parameters = function (R, a, height) {
    document.getElementById("R").innerText = R.toString()
    document.getElementById("a").innerText = a.toString()
    document.getElementById("height").innerText = height.toString()
}

let update_time = function (time) {
    document.getElementById("time").innerText = time.toString()
}

// Glider to move height of container
startZ = board.createElement('glider', [0, 10, board.defaultAxes.y], {
    name:'Height',
    strokeColor:'blue',
    fillColor:'blue'
})

// Euler method function
function solve_euler(x0, I, dt, f) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        let dx_dt = data[i - 1][0] + dt * f(0, data[i - 1])[0]
        data.push([dx_dt])
    }
    return data
}

// Adams-Bashforth 2 method function
function solve_adams_bashforth_2(x0, I, dt, f) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        if (i === 1) {
            // RK4 for 1st iteration (10 steps)
            let data_temp = [...data]
            for (let j = 1; j <= 10; j++) {
                let k1 = f(0, data_temp[j - 1][0])
                let k2 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k1)
                let k3 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k2)
                let k4 = f(0, data_temp[j - 1][0] + dt / 10 * k3)
                let dx_dt = data_temp[j - 1][0] + dt / 10 * (1 / 6 * k1 + 1 / 3 * k2 + 1 / 3 * k3 + 1 / 6 * k4)
                data_temp.push([dx_dt])
            }
            data.push(data_temp[data_temp.length - 1])
        } else {
            // Adams Bashforth, k=2
            let dx_dt = data[i - 1][0] + dt * (3 / 2 * f(0, data[i - 1][0]) - 1 / 2 * f(0, data[i - 2][0]))
            if (dx_dt > data[i - 1][0])
                data.push([NaN])
            data.push([dx_dt])
        }
    }
    return data
}

// Adams-Bashforth 3 method function
function solve_adams_bashforth_3(x0, I, dt, f) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        if (i < 3) {
            // RK4 for 1st & 2nd iteration (20 steps)
            let data_temp = [...data]
            for (let j = i; j <= i + 9; j++) {
                let k1 = f(0, data_temp[j - 1][0])
                let k2 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k1)
                let k3 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k2)
                let k4 = f(0, data_temp[j - 1][0] + dt / 10 * k3)
                let dx_dt = data_temp[j - 1][0] + dt / 10 * (1 / 6 * k1 + 1 / 3 * k2 + 1 / 3 * k3 + 1 / 6 * k4)
                data_temp.push([dx_dt])
            }
            data.push(data_temp[data_temp.length - 1])
        } else {
            // Adams Bashforth, k=3
            let dx_dt = data[i - 1][0] + dt * (23 / 12 * f(0, data[i - 1][0]) - 4 / 3 * f(0, data[i - 2][0])
                + 5 / 12 * f(0, data[i - 3][0]))
            if (dx_dt > data[i - 1][0])
                data.push([NaN])
            data.push([dx_dt])
        }
    }
    return data
}

function solve_adams_moulton_3(x0, I, dt, f) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        if (i < 2) {
            // RK4 for 1st iteration
            let data_temp = [...data]
            for (let j = 1; j <= 10; j++) {
                let k1 = f(0, data_temp[j - 1][0])
                let k2 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k1)
                let k3 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k2)
                let k4 = f(0, data_temp[j - 1][0] + dt / 10 * k3)
                let dx_dt = data_temp[j - 1][0] + dt / 10 * (1 / 6 * k1 + 1 / 3 * k2 + 1 / 3 * k3 + 1 / 6 * k4)
                data_temp.push([dx_dt])
            }
            data.push(data_temp[data_temp.length - 1])
        } else {
            // predictor - AB2
            let dx_dt = data[i - 1][0] + dt * (3 / 2 * f(0, data[i - 1][0]) - 1 / 2 * f(0, data[i - 2][0]))
            let f_new = f(0, dx_dt)
            // corrector (optimized)
            dx_dt = dx_dt + dt * 5 / 12 * (f_new - 2 * f(0, data[i - 1][0]) + 1 * f(0, data[i - 2][0]))
            if (dx_dt < 0)
                dx_dt = NaN
            data.push([dx_dt])
        }
    }
    return data
}

function solve_adams_moulton_4(x0, I, dt, f) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        if (i < 3) {
            // RK4 for 1st and 2nd iteration
            let data_temp = [...data]
            for (let j = i; j <= i + 9; j++) {
                let k1 = f(0, data_temp[j - 1][0])
                let k2 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k1)
                let k3 = f(0, data_temp[j - 1][0] + dt / 10 / 2 * k2)
                let k4 = f(0, data_temp[j - 1][0] + dt / 10 * k3)
                let dx_dt = data_temp[j - 1][0] + dt / 10 * (1 / 6 * k1 + 1 / 3 * k2 + 1 / 3 * k3 + 1 / 6 * k4)
                data_temp.push([dx_dt])
            }
            data.push(data_temp[data_temp.length - 1])
        } else {
            // predictor - AB3
            let dx_dt = data[i - 1][0] + dt * (23 / 12 * f(0, data[i - 1][0]) - 4 / 3 * f(0, data[i - 2][0])
                + 5 / 12 * f(0, data[i - 3][0]))
            let f_new = f(0, dx_dt)
            // corrector (optimized)
            dx_dt = dx_dt + dt * 3 / 8 * (f_new - 3 * f(0, data[i - 1][0]) + 3 * f(0, data[i - 2][0]) - f(0, data[i - 3][0]))
            if (dx_dt < 0)
                dx_dt = NaN
            data.push([dx_dt])
        }
    }
    return data
}

// Midpoint method function
function solve_midpoint(x0, I, dt, f) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        let dx_dt = data[i - 1][0] + dt * f(0, data[i - 1][0] + dt / 2 * f(0, data[i - 1][0]))
        data.push([dx_dt])
    }
    return data
}

// Root function x(t)
let f_real = function (t1, R, a, height) {
    let g = 9.80665
    let c1 = Math.sqrt(2 * height) / (R * R)
    let y1 = []
    y1[0] = (Math.pow(a, 4) * g * Math.pow(t1, 2)) / (2 * Math.pow(R, 4)) + Math.pow(R, 4) * Math.pow(c1, 2) / 2 - Math.pow(a, 2) * Math.sqrt(g) * c1 * t1
    return y1
}

// Analytical solution function with step dt (for plot)
function solve_real(x0, I, R, a, dt, height) {
    let data = [x0]
    let g = 9.80665
    I[1] = Math.pow(R, 2) / Math.pow(a, 2) * Math.sqrt(2 * height / g)
    update_time(I[1])
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; i++) {
        data.push([f_real(I[0] + dt * i, R, a, height)])
    }
    return data
}

function solve_newton(x0, f, f_dot, tol = 1.0e-9) {
    let max_iter = 50
    let x = x0
    let prev = 0
    for (let i = 0; i < max_iter; i++) {
        prev = x
        x -= f(0, x) / f_dot(0, x)
        if (Math.abs(x - prev) < tol) {
            return x
        }
        if (isNaN(x)) {
            return x
        }
    }
    return x
}

function solve_implicit_euler(x0, I, dt, f, f_dot) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    let exp_dot = function (t1, x1) {
        return dt * f_dot(t1, x1) - 1
    }
    for (let i = 1; i < N; ++i) {
        let exp = function (t1, x1) {
            return (data[i - 1][0] + dt * f(t1, x1) - x1)
        }
        let dx_dt = solve_newton(data[i - 1][0], exp, exp_dot)
        data.push([dx_dt])
    }
    return data
}

function solve_implicit_midpoint(x0, I, dt, f, f_dot) {
    let data = [x0]
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        let k1 = f(0, data[i - 1][0])
        let exp = function (t1, x1) {
            return f(t1, x1 * dt / 2 + data[i - 1][0]) - x1
        }
        let exp_dot = function (t1, x1) {
            return f_dot(t1, x1 * dt / 2 + data[i - 1][0]) - 1
        }
        let dx_dt = data[i - 1][0] + dt * solve_newton(k1, exp, exp_dot)
        data.push([dx_dt])
    }
    return data
}

// Universal ODE solver (any method)
function ode_diff_water(method = "real", R, a, h, height, update) {
    let I1 = [0, 17]
    if (h <= 0) h = 1
    if (a > R) a = R
    if (a <= 0) a = 1
    if (R <= 0) R = 1
    if (method === "real") {
        h = 0.01
    }
    update(R, a, height)

    // xdot(t)
    let f1 = function (t1, x1) {
        let g = 9.80665
        let y1 = []
        y1[0] = -(a * a) / (R * R) * Math.sqrt(2 * g * x1)
        return y1
    }

    let f1_dot = function (t1, x1) {
        let g = 9.80665
        let y1 = []
        y1[0] = -(a * a) / (2 * R * R * Math.sqrt(x1)) * Math.sqrt(2 * g)
        return y1
    }

    let x01 = [height]
    let data1 = []
    if (method === "euler") {
        data1 = solve_euler(x01, I1, h, f1)
    } else if (method === "midpoint") {
        data1 = solve_midpoint(x01, I1, h, f1)
    } else if (method === "ab2") {
        data1 = solve_adams_bashforth_2(x01, I1, h, f1)
    } else if (method === "ab3") {
        data1 = solve_adams_bashforth_3(x01, I1, h, f1)
    } else if (method === "real") {
        data1 = solve_real(x01, I1, R, a, h, height)
    } else if (method === "imp_euler") {
        data1 = solve_implicit_euler(x01, I1, h, f1, f1_dot)
    } else if (method === "imp_midpoint") {
        data1 = solve_implicit_midpoint(x01, I1, h, f1, f1_dot)
    } else if (method === "am3") {
        data1 = solve_adams_moulton_3(x01, I1, h, f1)
    } else if (method === "am4") {
        data1 = solve_adams_moulton_4(x01, I1, h, f1)
    }
    let q1 = I1[0]
    for (let i = 0; i < data1.length; i++) {
        data1[i].push(q1)
        q1 += h
    }
    return data1
}

function compute_errors(i) {
    graphs[i][4].err = []
    graphs[i][4].abs_err = []
    for (let j = 0; j < graphs[i][4].data.length; j++) {
        let real = f_real(graphs[i][4].data[j][1], parseFloat(R_slider.Value()),
            parseFloat(a_slider.Value()), startZ.Y())
        graphs[i][4].err.push(Math.abs(graphs[i][4].data[j][0] - real) / real)
        graphs[i][4].abs_err.push(Math.abs(graphs[i][4].data[j][0] - real))
    }
}

// Evaluating methods
for (let i of ["euler", "midpoint", "ab2", "ab3", "am3", "am4", "imp_euler", "imp_midpoint", "real"]) {
    graphs[i][4].data = ode_diff_water(i, parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters)
    if (i !== "real") {
        compute_errors(i)
    }
}

update_table()

// Plots setup

for (let elem in graphs) {
    let data = []
    let t = []
    let err = []
    for (let i = 0; i < graphs[elem][4].data.length; i++) {
        data[i] = graphs[elem][4].data[i][0]
        if (elem !== "real")
            err[i] = graphs[elem][4].err[i]
        t[i] = graphs[elem][4].data[i][1]
    }
    graphs[elem][0] = board.create('curve', [t, data], {strokeColor:graphs[elem][5], strokeWidth:'3px'})
    graphs[elem][0].updateDataArray = function () {
        graphs[elem][4].data = ode_diff_water(elem, parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
            parseFloat(h_slider.Value()), startZ.Y(), update_parameters)
        elem !== "real" && compute_errors(elem)
        this.dataX = []
        this.dataY = []
        for (let i = 0; i < graphs[elem][4].data.length; i++) {
            this.dataX[i] = graphs[elem][4].data[i][1]
            this.dataY[i] = graphs[elem][4].data[i][0]
        }
    }
    graphs[elem][1] = board.create('glider', [graphs[elem][0]],
        {
            name:graphs[elem][6],
            strokeColor:graphs[elem][5],
            fillColor:graphs[elem][5]
        })
    if (elem !== "real") {
        graphs[elem][7] = board.create('curve', [t, err], {strokeColor:graphs[elem][5], strokeWidth:'3px'})
        graphs[elem][7].updateDataArray = function () {
            graphs[elem][4].data = ode_diff_water(elem, parseFloat(R_slider.Value()), parseFloat(a_slider.Value()),
                parseFloat(h_slider.Value()), startZ.Y(), update_parameters)
            compute_errors(elem)
            this.dataX = []
            this.dataY = []
            for (let i = 0; i < graphs[elem][4].data.length; i++) {
                this.dataX[i] = graphs[elem][4].data[i][1]
                this.dataY[i] = graphs[elem][4].err[i]
            }
        }
    }
    if (graphs[elem][2] === false) {
        graphs[elem][1].hideElement()
        graphs[elem][0].hideElement()
        graphs[elem][7].hideElement()
    }

}
