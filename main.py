@namespace
class SpriteKind:
    drop_off = SpriteKind.create()
    house = SpriteKind.create()

# variables
speed = 0
steer = 0
acceleration = 10
steer_amount = 0.05
deceleration = 0.9
steer_reduction = 0.5
has_parcel = False
minimap_open = False #

# setup
info.set_score(0)
info.start_countdown(120)
scene.set_tile_map_level(assets.tilemap("level"))

# sprites
car = sprites.create(assets.image("car"), SpriteKind.player)
transformSprites.rotate_sprite(car, 90)
scene.camera_follow_sprite(car)

# minimap # 
minimap_object = minimap.minimap(MinimapScale.Quarter)
minimap_image = minimap.get_image(minimap_object)
minimap_sprite = sprites.create(minimap_image)
minimap_sprite.z = 10
minimap_sprite.set_flag(SpriteFlag.RELATIVE_TO_CAMERA, True)
minimap_sprite.set_flag(SpriteFlag.INVISIBLE, True)

def setup_level():
    tiles.place_on_tile(car, tiles.get_tile_location(2, 2))
    for tile in tiles.get_tiles_by_type(assets.tile("house spawn")):
        house = sprites.create(assets.image("house"), SpriteKind.house)
        house.scale = 0.75
        tiles.place_on_tile(house, tile)
        house.y -= 12
    spawn_parcel()
setup_level()

def place_parcel(parcel: Sprite):
    col = randint(1, grid.num_columns() - 1)
    row = randint(1, grid.num_rows() - 1)
    tiles.place_on_tile(parcel, tiles.get_tile_location(col, row))
    if tiles.tile_at_location_is_wall(parcel.tilemap_location()):
        place_parcel(parcel)

def spawn_parcel():
    parcel = sprites.create(assets.image("parcel"), SpriteKind.food)
    place_parcel(parcel)

def collect_parcel(car, parcel):
    global has_parcel
    has_parcel = True
    parcel.destroy()
    select_target()
sprites.on_overlap(SpriteKind.player, SpriteKind.food, collect_parcel)

def select_target():
    drop_off = sprites.create(image.create(16, 16), SpriteKind.drop_off)
    animation.run_image_animation(drop_off, assets.animation("drop off"), 200, True)
    house_locations = tiles.get_tiles_by_type(assets.tile("house spawn"))
    house_pos = house_locations[randint(0, len(house_locations) -1 )]
    delivery_pos = tiles.get_tile_location(house_pos.col, house_pos.row + 1)
    tiles.place_on_tile(drop_off, delivery_pos)

def drop_off_parcel(car, drop_off):
    global has_parcel
    has_parcel = False
    info.change_score_by(100)
    spawn_parcel()
    drop_off.destroy()
sprites.on_overlap(SpriteKind.player, SpriteKind.drop_off, drop_off_parcel)

def toggle_map(): #
    global minimap_open
    if minimap_open:
        minimap_sprite.set_flag(SpriteFlag.INVISIBLE, True)
        minimap_open = False
    else:
        minimap_sprite.set_flag(SpriteFlag.INVISIBLE, False)
        minimap_open = True
controller.A.on_event(ControllerButtonEvent.PRESSED, toggle_map)

def update_minimap(): #
    if minimap_open:
        minimap_object = minimap.minimap(MinimapScale.Quarter)
        minimap.include_sprite(minimap_object, car)
        for house in sprites.all_of_kind(SpriteKind.house):
            minimap.include_sprite(minimap_object, house)
        if has_parcel:
            drop_off = sprites.all_of_kind(SpriteKind.drop_off)[0]
            minimap.include_sprite(minimap_object, drop_off)
        else:
            parcel = sprites.all_of_kind(SpriteKind.food)[0]
            minimap.include_sprite(minimap_object, parcel)
        minimap_sprite.set_image(minimap.get_image(minimap_object))
game.on_update_interval(100, update_minimap)

def accelerate():
    global speed
    if controller.up.is_pressed():
        speed += acceleration
    elif controller.down.is_pressed():
        speed -= acceleration
    speed *= deceleration
    
def turn():
    global steer
    if controller.right.is_pressed():
        steer += steer_amount
    elif controller.left.is_pressed():
        steer -= steer_amount
    steer *= steer_reduction
    transformSprites.change_rotation(car, (steer * speed))

def calculate_velocities():
    car_dir = transformSprites.get_rotation(car) * Math.PI/180
    car.vx = Math.sin(car_dir) * speed
    car.vy = Math.cos(car_dir) * -speed

def tick():
    accelerate()
    turn()
    calculate_velocities()
game.on_update(tick)

