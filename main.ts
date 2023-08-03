namespace SpriteKind {
    export const drop_off = SpriteKind.create()
}

//  variables
let speed = 0
let steer = 0
let acceleration = 10
let steer_amount = 0.05
let deceleration = 0.9
let steer_reduction = 0.5
let has_parcel = false
//  setup
info.setScore(0)
info.startCountdown(90)
//  sprites
let car = sprites.create(assets.image`car`, SpriteKind.Player)
transformSprites.rotateSprite(car, 90)
scene.cameraFollowSprite(car)
function setup_level() {
    let house: Sprite;
    scene.setTileMapLevel(assets.tilemap`level`)
    tiles.placeOnTile(car, tiles.getTileLocation(2, 2))
    for (let tile of tiles.getTilesByType(assets.tile`house spawn`)) {
        house = sprites.create(assets.image`house`)
        house.scale = 0.75
        tiles.placeOnTile(house, tile)
        house.y -= 12
    }
    spawn_parcel()
}

setup_level()
function place_parcel(parcel: Sprite) {
    let max_x = grid.numColumns() * 16 - 24
    let max_y = grid.numRows() * 16 - 24
    parcel.setPosition(randint(24, max_x), randint(24, max_y))
    if (tiles.tileAtLocationIsWall(parcel.tilemapLocation())) {
        place_parcel(parcel)
    }
    
}

function spawn_parcel() {
    let parcel = sprites.create(assets.image`parcel`, SpriteKind.Food)
    place_parcel(parcel)
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function collect_parcel(car: Sprite, parcel: Sprite) {
    
    has_parcel = true
    parcel.destroy()
    select_target()
})
function select_target() {
    let drop_off = sprites.create(image.create(16, 16), SpriteKind.drop_off)
    animation.runImageAnimation(drop_off, assets.animation`drop off`, 200, true)
    let house_locations = tiles.getTilesByType(assets.tile`house spawn`)
    let house_pos = house_locations[randint(0, house_locations.length - 1)]
    let delivery_pos = tiles.getTileLocation(house_pos.col, house_pos.row + 1)
    tiles.placeOnTile(drop_off, delivery_pos)
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.drop_off, function drop_off_parcel(car: Sprite, drop_off: Sprite) {
    
    has_parcel = false
    info.changeScoreBy(100)
    spawn_parcel()
    drop_off.destroy()
})
scene.onHitWall(SpriteKind.Player, function hit_wall() {
    
    speed *= -0.1
})
function accelerate() {
    
    if (controller.up.isPressed()) {
        speed += acceleration
    } else if (controller.down.isPressed()) {
        speed -= acceleration
    }
    
    speed *= deceleration
}

function turn() {
    
    if (controller.right.isPressed()) {
        steer += steer_amount
    } else if (controller.left.isPressed()) {
        steer -= steer_amount
    }
    
    steer *= steer_reduction
    transformSprites.changeRotation(car, steer * speed)
}

function calculate_velocities() {
    let car_dir = transformSprites.getRotation(car) * Math.PI / 180
    car.vx = Math.sin(car_dir) * speed
    car.vy = Math.cos(car_dir) * -speed
}

game.onUpdate(function tick() {
    accelerate()
    turn()
    calculate_velocities()
})
