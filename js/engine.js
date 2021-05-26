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

let methods = ["euler", "midpoint", "ab2", "ab3", "imp_euler", "imp_midpoint", "am3", "am4", "bsh"]

let graphs = {
    "real":[null, null, true, "z(t)", {
        "data":[],
    }, "blue", "Z"],
    "euler":[null, null, true, "Метод Эйлера", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "red", "EU", null, null],
    "midpoint":[null, null, false, "Метод средней точки", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "green", "MP", null, null],
    "ab2":[null, null, false, "Метод Адамса-Башфорта 2", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "darkorange", "AB2", null, null],
    "ab3":[null, null, false, "Метод Адамса-Башфорта 3", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "hotpink", "AB3", null, null],
    "imp_euler":[null, null, true, "Неявный метод Эйлера", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "saddlebrown", "IEU", null, null],
    "imp_midpoint":[null, null, false, "Неявный метод средней точки", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "darkslateblue", "IMP", null, null],
    "am3":[null, null, false, "Метод Адамса-Мултона 3", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "lime", "AM3", null, null],
    "am4":[null, null, false, "Метод Адамса-Мултона 4", {
        "data":[],
        "abs_err":[],
        "err":[]
    }, "black", "AM4", null, null],
    "bsh":[null, null, false, "Метод Богацкого-Шампина", {
        "data":[],
        "abs_err":[],
        "err":[],
        "est_err":[]
    }, "red", "BSH", null, null],
}

let iter = 0

// Change XY range
function update_range() {
    let x_max = document.getElementById("xmax").value
    let y_max = document.getElementById("ymax").value
    board.setBoundingBox([-0.1, y_max * 0.5, x_max * 0.5, -0.4])
    board.update()
}

// Hide/show methods
function update_graph(name, element) {
    let objects = graphs[name]
    if (element.checked) {
        objects[0].showElement()
        objects[1].showElement()
        objects[7].showElement()
        objects[8].showElement()
        objects[2] = true
    } else {
        objects[0].hideElement()
        objects[1].hideElement()
        objects[7].hideElement()
        objects[8].hideElement()
        objects[2] = false
    }
    update_table()
}

function switch_graphs(type, element) {
    for (let elem in graphs) {
        if (element.checked) {
            if (graphs[elem][2] === true) {
                if (type === 0) {
                    graphs[elem][0].showElement()
                    graphs[elem][1].showElement()
                } else if (elem !== "real") {
                    graphs[elem][7].showElement()
                    graphs[elem][8].showElement()
                }
            }
        } else {
            if (type === 0) {
                graphs[elem][0].hideElement()
                graphs[elem][1].hideElement()
            } else if (elem !== "real") {
                graphs[elem][7].hideElement()
                graphs[elem][8].hideElement()
            }
        }
    }

}

// Write to HTML table methods points data, errors
function update_table() {
    let output = "<tr><th>t</th>"
    let abs_errors = output
    let errors = output
    for (let elem in graphs) {
        if (graphs[elem][2]) {
            if (elem === "bsh") {
                output += "<th> t (Адаптивный шаг) </th>"
                abs_errors += "<th> t (Адаптивный шаг)</th>"
                errors += "<th> t (Адаптивный шаг)</th>"
            }
            output += "<th>" + graphs[elem][3] + "</th>"
            if (elem !== "real") {
                abs_errors += "<th>" + graphs[elem][3] + "</th>"
                errors += "<th>" + graphs[elem][3] + "</th>"
            }
        }
    }
    let real = 0
    for (let i = 0; i < graphs.midpoint[4].data.length; i++) {
        if (isNaN(graphs.midpoint[4].data[i][0])) break
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
                if (j === "bsh") {
                    output += "<td>" + graphs[j][4].data[i][1].toString() + "</td>"
                    errors += "<td>" + graphs[j][4].data[i][1].toString() + "</td>"
                    abs_errors += "<td>" + graphs[j][4].data[i][1].toString() + "</td>"
                }
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
let update_parameters = function (params, height) {
    document.getElementById("R").innerText = params[1].toString()
    document.getElementById("a").innerText = params[0].toString()
    document.getElementById("height").innerText = height.toString()
}

let update_time = function (time) {
    document.getElementById("time").innerText = time.toString()
}

// Get params
function get_params() {
    let a = a_slider.Value()
    let R = R_slider.Value()
    if (a > R) a = R
    if (a <= 0) a = 1
    if (R <= 0) R = 1
    return [a, R]
}

// Glider to move height of container
startZ = board.createElement('glider', [0, 10, board.defaultAxes.y], {
    name:'Height',
    strokeColor:'blue',
    fillColor:'blue'
})

// f(t)
let func = function (t1, x1, param) {
    iter += 1
    let g = 9.80665
    let y1 = []
    y1[0] = -(param[0] * param[0]) / (param[1] * param[1]) * Math.sqrt(2 * g * x1)
    return y1
}


// f_dot(t)
let func_dot = function (t1, x1, param) {
    iter += 1
    let g = 9.80665
    let y1 = []
    y1[0] = -(param[0] * param[0]) / (2 * param[1] * param[1] * Math.sqrt(x1)) * Math.sqrt(2 * g)
    return y1
}


// SINGLE STEP METHODS

// Euler method step function
function euler_step(prev, dt, f) {
    let dx_dt = prev[0] + dt * f(0, prev)[0]
    return [dx_dt]
}

// Midpoint method step function
function midpoint_step(prev, dt, f) {
    let dx_dt = prev[0] + dt * f(0, prev[0] + dt / 2 * f(0, prev[0]))
    return [dx_dt]
}

// Single step function (saves data to array)
function solve_single_step(data, x0, I, dt, f, f_step) {
    iter = 0
    data.push(x0)
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        data.push(f_step(data[i - 1], dt, f)) // just saving all data to array (can be changed)
    }
    console.log(f_step.name)
    console.log(iter)
    return data
}


// SINGLE STEP IMPLICIT METHODS

// Newton method
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

// Implicit Euler method step function
function euler_implicit_step(prev, dt, f, f_dot) {
    let exp_dot = function (t1, x1) {
        return dt * f_dot(t1, x1) - 1
    }
    let exp = function (t1, x1) {
        return (prev[0] + dt * f(t1, x1) - x1)
    }
    return [solve_newton(prev[0], exp, exp_dot)]
}

// Implicit midpoint method step function
function midpoint_implicit_step(prev, dt, f, f_dot) {
    let exp = function (t1, x1) {
        return f(t1, x1 * dt / 2 + prev[0]) - x1
    }
    let exp_dot = function (t1, x1) {
        return f_dot(t1, x1 * dt / 2 + prev[0]) - 1
    }
    let k1 = f(0, prev[0])
    return [prev[0] + dt * solve_newton(k1, exp, exp_dot)]
}

// One step implicit function (saves data to array)
function solve_implicit_single_step(data, x0, I, dt, f, f_dot, f_step) {
    iter = 0
    data.push(x0)
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        data.push(f_step(data[i - 1], dt, f, f_dot))
    }
    console.log(f_step.name)
    console.log(iter)
    return data
}


// MULTI STEP METHODS

// RK4 step for AB methods
function rk4_step(prev, dt, f) {
    let k1 = f(0, prev[0])
    let k2 = f(0, prev[0] + dt / 10 / 2 * k1)
    let k3 = f(0, prev[0] + dt / 10 / 2 * k2)
    let k4 = f(0, prev[0] + dt / 10 * k3)
    let dx_dt = prev[0] + dt / 10 * (1 / 6 * k1 + 1 / 3 * k2 + 1 / 3 * k3 + 1 / 6 * k4)
    return [dx_dt]
}

// Adams-Bashforth 2 step function
function adams_bashforth_2_step(prev, dt, f) {
    let i = prev.length
    let dx_dt = prev[i - 1][0] + dt * (3 / 2 * f(0, prev[i - 1][0]) - 1 / 2 * f(0, prev[i - 2][0]))
    if (dx_dt > prev[i - 1][0])
        return [NaN]
    else
        return [dx_dt]
}

// Adams-Bashforth 3 step function
function adams_bashforth_3_step(prev, dt, f) {
    let i = prev.length
    let dx_dt = prev[i - 1][0] + dt * (23 / 12 * f(0, prev[i - 1][0]) - 4 / 3 * f(0, prev[i - 2][0])
        + 5 / 12 * f(0, prev[i - 3][0]))
    if (dx_dt > prev[i - 1][0])
        return [NaN]
    else
        return [dx_dt]
}

// Multi step methods function (saves data to array)
function solve_multi_step(data, x0, I, dt, f, one_step, f_step, n) {
    iter = 0
    data.push(x0)
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; ++i) {
        if (i < n) {
            // One step method for 1st iteration (10 steps)
            let data_temp = [...data]
            for (let j = 1; j <= 10; j++) {
                data_temp.push(one_step(data_temp[i + j - 2], dt, f))
            }
            data.push(data_temp[data_temp.length - 1])
        } else {
            // Multi step method
            data.push(f_step(data, dt, f)) // You can send only last n values as prev
        }
    }
    console.log(f_step.name)
    console.log(iter)
    return data
}


// MULTI STEP IMPLICIT METHODS

// Adams-Moulton 3 step function
function adams_moulton_3_step(prev, prev_f, dt, f) {
    let i = prev_f.length
    // predictor - AB2
    let dx_dt = prev[0] + dt * (3 / 2 * prev_f[i - 1] - 1 / 2 * prev_f[i - 2])
    let next_f = f(0, dx_dt)
    // corrector (optimized)
    dx_dt = dx_dt + dt * 5 / 12 * (next_f - 2 * prev_f[i - 1] + 1 * prev_f[i - 2])
    if (dx_dt < 0)
        dx_dt = NaN
    return [[dx_dt], next_f]
}

// Adams-Moulton 4 step function
function adams_moulton_4_step(prev, prev_f, dt, f) {
    let i = prev_f.length
    let dx_dt = prev[0] + dt * (23 / 12 * prev_f[i - 1] - 4 / 3 * prev_f[i - 2]
        + 5 / 12 * prev_f[i - 3])
    let next_f = f(0, dx_dt)
    // corrector (optimized)
    dx_dt = dx_dt + dt * 3 / 8 * (next_f - 3 * prev_f[i - 1] + 3 * prev_f[i - 2] - prev_f[i - 3])
    if (dx_dt < 0)
        dx_dt = NaN
    return [[dx_dt], next_f]
}

// Multi step implicit methods function (saves data to array)
function solve_multi_step_implicit(data, x0, I, dt, f, one_step, f_step, n) {
    iter = 0
    data.push(x0)
    let N = (I[1] - I[0]) / dt
    let f_arr = [f(0, x0)]
    for (let i = 1; i < N; ++i) {
        if (i < n) {
            // RK4 for 1st iteration
            let data_temp = [...data]
            for (let j = 1; j <= 10; j++) {
                data_temp.push(one_step(data_temp[i + j - 2], dt, f))
            }
            data.push(data_temp[data_temp.length - 1])
            f_arr.push(f(0, data[i]))
        } else {
            let res = f_step(data[i - 1], f_arr, dt, f) // You can send only last n values as prev_f
            data.push(res[0])
            f_arr.push(res[1])
        }
    }
    console.log(f_step.name)
    console.log(iter)
    return data
}


// ONE STEP ADAPTIVE METHODS

// Bogacki Shampine step function
function bogacki_shampine_step(prev, h, f, tol, x) {
    let k1 = f(0, prev[0])
    let k2 = f(0, prev[0] + 1 / 2 * h * k1)
    let k3 = f(0, prev[0] + 3 / 4 * h * k2)
    let dx_dt = prev[0] + 2 / 9 * h * k1 + 1 / 3 * h * k2 + 4 / 9 * h * k3
    let k4 = f(0, dx_dt)
    let dx_dt_hat = prev[0] + 7 / 24 * h * k1 + 1 / 4 * h * k2 + 1 / 3 * h * k3 + 1 / 8 * h * k4
    x += h
    let err = dx_dt_hat - dx_dt
    h *= Math.pow(1 / Math.sqrt(err / tol), 1 / 4)
    return [[dx_dt_hat, x], h, err]
}

// One step adaptive methods function (saves data to array)
function solve_single_step_adaptive(data, x0, I, dt, f, tol, f_step) {
    iter = 0
    data.push([x0[0], 0])
    let err = []
    let h = dt
    let x = 0.0
    let i = 1
    while (x <= I[1]) {
        let res = f_step(data[i - 1], h, f, tol, x)
        data.push(res[0])
        x = res[0][1]
        h = res[1]
        i += 1
        err.push(res[2])
    }
    console.log(f_step.name)
    console.log(iter)
    return [data, err]
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
function solve_real(data, x0, I, params, dt, height) {
    let R = params[1]
    let a = params[0]
    data.push(x0)
    let g = 9.80665
    I[1] = Math.pow(R, 2) / Math.pow(a, 2) * Math.sqrt(2 * height / g)
    update_time(I[1])
    let N = (I[1] - I[0]) / dt
    for (let i = 1; i < N; i++) {
        data.push([f_real(I[0] + dt * i, R, a, height)])
    }
    return data
}

// Universal ODE solver (any method)
function ode_solver(method = "real", data1, params, h, height, update, f, f_dot) {
    let I1 = [0, 37]
    if (h <= 0) { h = 0.1 }
    if (method === "real") {
        h = 0.01
    }
    update(params, height)
    let f1 = function (t1, x1) {
        return f(t1, x1, params)
    }
    let f1_dot = function (t1, x1) {
        return f_dot(t1, x1, params)
    }
    let x01 = [height]
    if (method === "euler") {
        solve_single_step(data1, x01, I1, h, f1, euler_step)
    } else if (method === "midpoint") {
        solve_single_step(data1, x01, I1, h, f1, midpoint_step)
    } else if (method === "ab2") {
        solve_multi_step(data1, x01, I1, h, f1, rk4_step, adams_bashforth_2_step, 2)
    } else if (method === "ab3") {
        solve_multi_step(data1, x01, I1, h, f1, rk4_step, adams_bashforth_3_step, 3)
    } else if (method === "real") {
        solve_real(data1, x01, I1, params, h, height)
    } else if (method === "imp_euler") {
        solve_implicit_single_step(data1, x01, I1, h, f1, f1_dot, euler_implicit_step)
    } else if (method === "imp_midpoint") {
        solve_implicit_single_step(data1, x01, I1, h, f1, f1_dot, midpoint_implicit_step)
    } else if (method === "am3") {
        solve_multi_step_implicit(data1, x01, I1, h, f1, rk4_step, adams_moulton_3_step, 2)
    } else if (method === "am4") {
        solve_multi_step_implicit(data1, x01, I1, h, f1, rk4_step, adams_moulton_4_step, 3)
    } else if (method === "bsh") {
        let res = solve_single_step_adaptive(data1, x01, I1, h, f1, 1e-5, bogacki_shampine_step)
        graphs.bsh[4].est_err = res[1]
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
    console.log(i)
    let sum = 0
    for (let j = 0; j < graphs[i][4].err.length; j++) {
        if (!isNaN(graphs[i][4].err[j]))
            sum += graphs[i][4].err[j]
        else
            break;
    }
    console.log(sum / graphs[i][4].err.length)
}

// Evaluating methods
for (let i of ["euler", "midpoint", "ab2", "ab3", "am3", "am4", "bsh", "imp_euler", "imp_midpoint", "real"]) {
    let params = get_params()
    let data = []
    graphs[i][4].data = ode_solver(i, data, params,
        parseFloat(h_slider.Value()), startZ.Y(), update_parameters, func, func_dot)
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
        let params = get_params()
        let data = []
        graphs[elem][4].data = ode_solver(elem, data, params,
            parseFloat(h_slider.Value()), startZ.Y(), update_parameters, func, func_dot)
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
            let params = get_params()
            let data = []
            graphs[elem][4].data = ode_solver(elem, data, params,
                parseFloat(h_slider.Value()), startZ.Y(), update_parameters, func, func_dot)
            compute_errors(elem)
            this.dataX = []
            this.dataY = []
            for (let i = 0; i < graphs[elem][4].data.length; i++) {
                this.dataX[i] = graphs[elem][4].data[i][1]
                this.dataY[i] = graphs[elem][4].err[i]
            }
        }
        graphs[elem][8] = board.create('glider', [graphs[elem][7]],
            {
                name:graphs[elem][6],
                strokeColor:graphs[elem][5],
                fillColor:graphs[elem][5]
            })
    }
    if (graphs[elem][2] === false) {
        graphs[elem][1].hideElement()
        graphs[elem][0].hideElement()
        graphs[elem][7].hideElement()
        graphs[elem][8].hideElement()
    }

}
