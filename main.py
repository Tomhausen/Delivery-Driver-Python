@namespace
class SpriteKind:
    drop_off = SpriteKind.create()

# variables
speed = 0
steer = 0
acceleration = 10
steer_amount = 0.05
deceleration = 0.9
steer_reduction = 0.5
has_parcel = False

# setup
info.set_score(0)
info.start_countdown(120)

# sprites
car = sprites.create(assets.image("car"), SpriteKind.player)
transformSprites.rotate_sprite(car, 90)
scene.camera_follow_sprite(car) 

def setup_level():
    scene.set_tile_map_level(assets.tilemap("level"))
    tiles.place_on_tile(car, tiles.get_tile_location(2, 2))
    for tile in tiles.get_tiles_by_type(assets.tile("house spawn")):
        house = sprites.create(assets.image("house"))
        house.scale = 0.75
        tiles.place_on_tile(house, tile)
        house.y -= 12
    spawn_parcel()
setup_level()

def place_parcel(parcel: Sprite):
    max_x = (grid.num_columns() * 16) - 24
    max_y = (grid.num_rows() * 16) - 24
    parcel.set_position(randint(24, max_x), randint(24, max_y))
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

def hit_wall():
    global speed
    speed *= -0.1
scene.on_hit_wall(SpriteKind.player, hit_wall)

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

