document.addEventListener("DOMContentLoaded", () => {

    const game = document.querySelector("#game")
    let lines = []
    let divs = []
    let snake = []
    let skews = []
    let speed = 20
    let head
    let apple
    let position
    let index = 0
    let playing = false

    function start (){
        let counter = "a"
        for (i = 0; i < 20; i++){
            let line = new_div("line", game, lines)
            counter = (counter == "a") ? "b" : "a"

            for (j = 0; j < 20; j++){
                let div = new_div("div", line, divs)
                div.classList.add(counter)
                counter = (counter == "a") ? "b" : "a"
            }
        }// Background vert

        // Serpent et pomme
        head = new Snake("head", 750, 750, "r")
        new Snake("queue", 670, 750, "r", "last")
        apple = new Apple()
        apple.eated()

        document.addEventListener("keydown", keydownhandler)
    }

    function update (){
        if (playing){
            for (i = snake.length; i > 0; i--){
                let block = snake[i - 1]
                if (block.dir == "r") block.x += speed
                if (block.dir == "l") block.x -= speed
                if (block.dir == "u") block.y -= speed
                if (block.dir == "d") block.y += speed
                block.update_pos()
            }
            if (!(between(head.x, 0, 1900) && between(head.y, 0, 1900))) lose()
            if (collide_apple_snake(head, snake)) lose()
            if (collision(head, apple) || collision(apple, head)){
                position = null
                apple.eated()
            }
        }
    }

    function keydownhandler (e){
        if (head.dir == snake[1].dir){
            if ((e.key == "ArrowUp") && (head.dir != "u") && (head.dir != "d")) new_skew(head.x, head.y, game, skews, head, "u")
            if(e.key == "ArrowLeft" && (head.dir != "l") && (head.dir != "r")) new_skew(head.x, head.y, game, skews, head, "l")
            if(e.key == "ArrowRight" && (head.dir != "l") && (head.dir != "r")) new_skew(head.x, head.y, game, skews, head, "r")
            if(e.key == "ArrowDown" && (head.dir != "u") && (head.dir != "d")) new_skew(head.x, head.y, game, skews, head, "d")
            if (e.key == " ") playing = true
        }
    }

    
    function lose (){
        playing = false
        document.removeEventListener("keydown", keydownhandler)
        alert("You lost")
    }

    class Snake{
        constructor(name, x, y, dir, last){
            this.x = x
            this.y = y
            this.angle = 0
            this.dir = dir
            this.index = index++

            this.visual = new_div(name, game, null, last)
            if (snake[this.index - 1] && last) snake[this.index - 1].visual.classList.remove(last)
            snake.push(this)
            this.update_pos()
        }

        update_pos (){
            if (snake[this.index - 1]){
                let test = (((this.x == snake[this.index - 1].x) && ((this.dir == "r") || (this.dir == "l"))) || ((this.y == snake[this.index - 1].y) && ((this.dir == "u") || (this.dir == "d"))))
                if (test){
                    // if (this.x - 3 == snake[this.index - 1].x) this.x -= 3
                    // if (this.y - 3 == snake[this.index - 1].y) this.y -= 3
                    this.dir = snake[this.index - 1].dir
                    if (!snake[this.index + 1] && skews[0]){
                        skews[0].remove()
                        skews.shift()
                    }
                }
            }//Change direction
            
            if (this.dir == "r") this.angle = (this.index == 0) ? go_to(this.angle, nearest(this.angle, 0, 360), this.dir) : 0
            if (this.dir == "l") this.angle = (this.index == 0) ? go_to(this.angle, nearest(this.angle, 180, -180), this.dir) : 180
            if (this.dir == "u") this.angle = (this.index == 0) ? go_to(this.angle, nearest(this.angle, 270, -90), this.dir) : 270
            if (this.dir == "d") this.angle = (this.index == 0) ? go_to(this.angle, nearest(this.angle, 90, -270), this.dir) : 90

            this.visual.style.transform = "translate(" + this.x + "%, " + this.y + "%) rotateZ(" + this.angle + "deg)"
        }
    }

    class Apple{
        constructor (){
            this.visual = new_div("apple", game)
        }

        eated (){
            // Moves the apple
            while (!position){
                if (position = random_pos(head)){
                    this.x = position[0]
                    this.y = position[1]
                    if (collide_apple_snake(apple, snake)) position = null
                }
            }
            this.visual.style.transform = "translate(" + this.x + "%, " + this.y + "%)"

            // Add queue to snake
            let parent = snake[snake.length - 1]
            if (parent.dir == "r") new Snake("queue", parent.x - 80, parent.y, parent.dir, "last")
            if (parent.dir == "l") new Snake("queue", parent.x + 80, parent.y, parent.dir, "last")
            if (parent.dir == "u") new Snake("queue", parent.x, parent.y + 80, parent.dir, "last")
            if (parent.dir == "d") new Snake("queue", parent.x, parent.y - 80, parent.dir, "last")
        }
    }

    start()
    setInterval(() => {
        update()
    }, 30)
})

function new_div (name, parent, list, last){
    let div = document.createElement("div")
    div.classList.add(name)
    if (parent) parent.prepend(div)
    if (list) list.push(div)
    if (last) div.classList.add(last)

    return div
}

function new_skew (x, y, parent, list, head, dir){
    new_div("queue", parent, list).style.transform = "translate(" + x + "%, " + y + "%)"
    head.dir = dir
}

function collision (obj1, obj2, gap = 50){
    if ((obj1.x < obj2.x) && ((obj1.x + gap) > obj2.x)){
        if ((obj1.y > obj2.y) && ((obj2.y + gap) > obj1.y)){
            return true
        }
        if ((obj1.y < obj2.y) && ((obj1.y + gap) > obj2.y)){
            return true
        }
    }
    return false
}

function collide_apple_snake (obj, list){
    for (i = 1; i < list.length; i++){
        if (collision(list[i], obj, 30) || collision(obj, list[i], 30)){
            return true
        }
    }
    return false
}

function between (a, b, c){
    return ((a >= b) && (a <= c))
}

function nearest (a, b, c){
    return (Math.abs(a - b) > Math.abs(a - c)) ? c : b
}

function go_to (a, b, dir){
    if (a < b) return a+10
    if (a > b) return a-10
    if (a == b){
        if (dir == "r") return 0
        if (dir == "l") return 180
        if (dir == "u") return 270
        if (dir == "d") return 90
    }
}

function random_pos (head){
    let a = Math.floor(Math.random() * 1900)
    let b = Math.floor(Math.random() * 1900)

    if (!between(a, head.x - 500, head.x + 500)) return [a, b]
    if (!between(b, head.y - 500, head.y + 500)) return [a, b]
}