const MOVE_SPEED = 120//Player speed
const JUMP_FORCE = 360//Player jump height
const BIG_JUMP_FORCE = 550//Jumping height when big
let CURRENT_JUMP_FORCE = JUMP_FORCE
const ENEMY_SPEED = 25//Goomba speed
const FALL_DEATH = 600
let isJumping = true


layers(['obj', 'ui'], 'obj')

         
const maps = [
  [
    '                               ',
    '                               ',
    '                               ',
    '                               ',
    '                               ',
    '      %    =*=%=               ',
    '                               ',
    '                        -+     ',
    '                ^    ^  ()     ',
    'xxxxxxxxxxxxxxxxxxxxxxxxxx   xx',
  ], [
    '@                              @',
    '@                              @',
    '@                              @',
    '@         a7aaa        s       @',
    '@                    s s       @',
    '@                  s s s     -+@',
    '@      !         s s s s     ()@',
    'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz@',
  ], [
    '@                              @',
    '@                              @',
    '@                              @',
    '@         a777a                @',
    '@                    s         @',
    '@                  s s  !    -+@',
    '@      !   ! ! ! s s s   !   ()@',
    'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz@',

  ], [
    '@                            -+@',
    '@                     !!!!   ()@',
    '@                            @@@',
    '@         a*77a                @',
    '@                    s         @',
    '@                  s s       -+@',
    '@      !   ! ! ! s s s  ! !  ()@',
    'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz@',

  ]
]


const levelCfg = {
  width: 20,
  height: 20,
  '=': [sprite('block'), solid()],
  'x': [sprite('brick'), solid()],
  '$': [sprite('coin'), 'coin'],
  '%': [sprite('question '), 'coin-surpise', solid()],
  '*': [sprite('question '), 'mushroom-surpise', solid()],
  '}': [sprite('unboxed'), solid()],
  '(': [sprite('pipe-left'), scale(0.5), solid(),],
  ')': [sprite('pipe-right'), scale(0.5), solid()],
  '-': [sprite('pipe-top-left-side'), scale(0.5), solid(), 'pipe'],
  '+': [sprite('pipe-top-right-side'), scale(0.5), solid(), 'pipe'],
  '^': [sprite('evil-shroom-1'), solid(), 'dangerous', body()],
  '#': [sprite('mushroom'), 'mushroom'],
  '@': [sprite('blue-brick'), solid(), scale(0.5)],
  'z': [sprite('blue-block'), solid(), scale(0.5)],
  'a': [sprite('blue-brick'), solid(), scale(0.5)],
  '!': [sprite('blue-evil-shroom'), 'dangerous', scale(0.5), solid()],
  's': [sprite('blue-steel'), solid(), scale(0.5)],
  '7': [sprite('blue-surprise'), 'coin-surpise', solid(), scale(0.5)],
}

const levelIndex = args.level ?? 0
const gameLevel = addLevel(maps[levelIndex], levelCfg)

//score and current level
const scoreGlobal = args.score ?? 0
const scoreLabel = add([
  text(scoreGlobal),
  pos(30, 6),
  layer('ui'),
  {
    value: '0',
  }
])

add([text('level ' + parseInt(levelIndex + 1)), pos(40, 6)])

function big() {
  let timer = 0
  let isBig = false
  return {
    update() {
      if (isBig) {
        timer -= dt()
        if (timer <= 0) {
          this.smallify()
        }
      }
    },
    isBig() {
      return isBig
    },
    //Mario regular size
    smallify() {
      this.scale = vec2(1)
      timer = 0
      isBig = false
      CURRENT_JUMP_FORCE = JUMP_FORCE
    },
    //decides how much bigger mario will be after taking the mushroom
    biggify(time) {
      this.scale = vec2(2)
      timer = time
      isBig = true
      CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
    }
  }
}

//spawn mario
const player = add([
  sprite('mario-standing'),
  pos(30, 0),
  body(),
  big(),
  origin('bot')
])


//Players die if goomba hit
player.collides('dangerous', (d) => {
  if (isJumping) {
    destroy(d)
  } else {
    go('lose', { score: scoreLabel.value })
  }
})

//The camera will follow the user
player.action(() => {
  camPos(player.pos)
  if (player.pos.y >= FALL_DEATH) {
    go('lose', { score: scoreLabel.value })
  }
})


//Mario movement 
keyDown('left', () => {
  player.move(-MOVE_SPEED, 0)
})

keyDown('right', () => {
  player.move(MOVE_SPEED, 0)
})


player.action(() => {
  if (player.grounded()) {
    isJumping = false
  }
})

keyPress('space', () => {
  if (player.grounded())
    isJumping = true
  player.jump(CURRENT_JUMP_FORCE)
})


//If the user bumps on the blocks the item will appear and the block will become unboxed
player.on('headbump', (obj) => {
  if (obj.is('coin-surpise')) {
    gameLevel.spawn('$', obj.gridPos.sub(0, 1))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0, 0))
  }
  if (obj.is('mushroom-surpise')) {
    gameLevel.spawn('#', obj.gridPos.sub(0, 1))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0, 0))
  }
})

action('mushroom', (m) => {
  m.move(30, 0)
})

player.collides('mushroom', (m) => {
  player.biggify(6)//controls how long marioo is big for 
  destroy(m)
})

//The coin value goes up and destroy the coin
player.collides('coin', (c) => {
  scoreLabel.value++
  scoreLabel.text = scoreLabel.value
  destroy(c)
})


//Goomba movement
action('dangerous', (d) => {
  d.move(-ENEMY_SPEED, 0)
})

//Allows player to go down the pipe
player.collides('pipe', () => {
  keyPress('down', () => {
    go('main', {
      level: (levelIndex + 1) % maps.length,
      score: scoreLabel.value
    })
  })
})

