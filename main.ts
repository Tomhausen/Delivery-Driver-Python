namespace SpriteKind {
    export const drop_off = SpriteKind.create()
    export const house = SpriteKind.create()
}

//  variables
let speed = 0
let steer = 0
let acceleration = 10
let steer_amount = 0.05
let deceleration = 0.9
let steer_reduction = 0.5
let has_parcel = false
let minimap_open = false
// 
//  setup
info.setScore(0)
info.startCountdown(120)
scene.setTileMapLevel(assets.tilemap`level`)
//  sprites
let car = sprites.create(assets.image`car`, SpriteKind.Player)
transformSprites.rotateSprite(car, 90)
scene.cameraFollowSprite(car)
//  minimap # 
let minimap_object = minimap.minimap(MinimapScale.Quarter)
let minimap_image = minimap.getImage(minimap_object)
let minimap_sprite = sprites.create(minimap_image)
minimap_sprite.z = 10
minimap_sprite.setFlag(SpriteFlag.RelativeToCamera, true)
minimap_sprite.setFlag(SpriteFlag.Invisible, true)
function setup_level() {
    let house: Sprite;
    tiles.placeOnTile(car, tiles.getTileLocation(2, 2))
    for (let tile of tiles.getTilesByType(assets.tile`house spawn`)) {
        house = sprites.create(assets.image`house`, SpriteKind.house)
        house.scale = 0.75
        tiles.placeOnTile(house, tile)
        house.y -= 12
    }
    spawn_parcel()
}

setup_level()
function place_parcel(parcel: Sprite) {
    let col = randint(1, grid.numColumns() - 1)
    let row = randint(1, grid.numRows() - 1)
    tiles.placeOnTile(parcel, tiles.getTileLocation(col, row))
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
controller.B.onEvent(ControllerButtonEvent.Pressed, function toggle_map() {
    // 
    
    if (minimap_open) {
        minimap_sprite.setFlag(SpriteFlag.Invisible, true)
        minimap_open = false
    } else {
        minimap_sprite.setFlag(SpriteFlag.Invisible, false)
        minimap_open = true
    }
    
})
game.onUpdateInterval(100, function update_minimap() {
    let minimap_object: minimap.Minimap;
    let drop_off: Sprite;
    let parcel: Sprite;
    // 
    if (minimap_open) {
        minimap_object = minimap.minimap(MinimapScale.Quarter)
        minimap.includeSprite(minimap_object, car)
        for (let house of sprites.allOfKind(SpriteKind.house)) {
            minimap.includeSprite(minimap_object, house)
        }
        if (has_parcel) {
            drop_off = sprites.allOfKind(SpriteKind.drop_off)[0]
            minimap.includeSprite(minimap_object, drop_off)
        } else {
            parcel = sprites.allOfKind(SpriteKind.Food)[0]
            minimap.includeSprite(minimap_object, parcel)
        }
        
        minimap_sprite.setImage(minimap.getImage(minimap_object))
    }
    
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
